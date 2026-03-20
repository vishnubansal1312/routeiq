import os
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import xgboost as xgb
from sklearn.model_selection import train_test_split
import joblib

app = FastAPI(title="RouteIQ ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "congestion_model.joblib"

# ── Input schema ────────────────────────────────────────────────────
class PredictionRequest(BaseModel):
    hour:        int
    dayOfWeek:   int
    month:       int
    weatherCode: int   = 800
    temp:        float = 30.0
    humidity:    float = 60.0
    windSpeed:   float = 5.0
    visibility:  float = 10.0
    distance:    float = 10.0
    originLat:   float = 28.6
    originLon:   float = 77.2
    destLat:     float = 28.7
    destLon:     float = 77.3

FEATURES = [
    "hour","dayOfWeek","month",
    "is_peak","is_weekend","is_night",
    "weather_severity","temp","humidity",
    "windSpeed","visibility","distance",
    "hour_sin","hour_cos","day_sin","day_cos",
]

# ── Feature engineering ─────────────────────────────────────────────
def make_features(d: PredictionRequest):
    is_peak    = 1 if (8 <= d.hour <= 10 or 17 <= d.hour <= 20) else 0
    is_weekend = 1 if d.dayOfWeek in [0, 6] else 0
    is_night   = 1 if (d.hour < 6 or d.hour > 22) else 0

    code = d.weatherCode
    if   code < 300: ws = 3
    elif code < 600: ws = 2
    elif code < 800: ws = 3
    elif code == 800: ws = 0
    else:            ws = 1

    return [
        d.hour, d.dayOfWeek, d.month,
        is_peak, is_weekend, is_night,
        ws, d.temp, d.humidity,
        d.windSpeed, min(d.visibility, 10), d.distance,
        np.sin(2 * np.pi * d.hour / 24),
        np.cos(2 * np.pi * d.hour / 24),
        np.sin(2 * np.pi * d.dayOfWeek / 7),
        np.cos(2 * np.pi * d.dayOfWeek / 7),
    ]

# ── Training data generator ─────────────────────────────────────────
def generate_data(n=5000):
    np.random.seed(42)
    rows = []
    for _ in range(n):
        hour  = np.random.randint(0, 24)
        day   = np.random.randint(0, 7)
        month = np.random.randint(1, 13)
        temp  = np.random.uniform(15, 45)
        hum   = np.random.uniform(20, 100)
        wind  = np.random.uniform(0, 20)
        vis   = np.random.uniform(0.2, 10)
        dist  = np.random.uniform(1, 80)
        wcode = np.random.choice([800,801,500,200,701], p=[0.4,0.2,0.2,0.1,0.1])

        score = 3.0
        if   8  <= hour <= 10: score += 3.5
        elif 17 <= hour <= 20: score += 3.0
        elif 12 <= hour <= 14: score += 1.5
        elif hour < 5:         score -= 1.5
        if day in [0, 6]:      score -= 1.0
        if wcode < 700:        score += 2.0
        elif wcode < 800:      score += 1.5
        if vis < 1:            score += 1.5
        if dist > 40:          score += 0.5
        score += np.random.normal(0, 0.8)
        score = float(np.clip(score, 1, 10))

        is_peak    = int(8 <= hour <= 10 or 17 <= hour <= 20)
        is_weekend = int(day in [0, 6])
        is_night   = int(hour < 6 or hour > 22)
        ws = 3 if wcode < 300 or (700 <= wcode < 800) else 2 if wcode < 700 else 1 if wcode > 800 else 0

        rows.append([
            hour, day, month, is_peak, is_weekend, is_night,
            ws, temp, hum, wind, vis, dist,
            np.sin(2*np.pi*hour/24), np.cos(2*np.pi*hour/24),
            np.sin(2*np.pi*day/7),   np.cos(2*np.pi*day/7),
            score
        ])
    cols = FEATURES + ["target"]
    return pd.DataFrame(rows, columns=cols)

# ── Train model ─────────────────────────────────────────────────────
def train():
    print("🤖 Training XGBoost model on 5000 samples...")
    df = generate_data(5000)
    X  = df[FEATURES]
    y  = df["target"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = xgb.XGBRegressor(
        n_estimators=200, max_depth=6,
        learning_rate=0.1, subsample=0.8,
        colsample_bytree=0.8, random_state=42, verbosity=0,
    )
    model.fit(X_train, y_train)
    from sklearn.metrics import mean_absolute_error
    mae = mean_absolute_error(y_test, model.predict(X_test))
    print(f"✅ Model trained! MAE: {mae:.3f}")
    joblib.dump(model, MODEL_PATH)
    return model

# ── Load or train on startup ────────────────────────────────────────
model = None

@app.on_event("startup")
async def startup():
    global model
    if os.path.exists(MODEL_PATH):
        print("📦 Loading saved model...")
        model = joblib.load(MODEL_PATH)
        print("✅ Model loaded!")
    else:
        model = train()

# ── Endpoints ───────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "RouteIQ ML running ✅", "model": "XGBoost"}

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/predict")
def predict(data: PredictionRequest):
    global model
    if model is None:
        model = train()

    features = make_features(data)
    X     = pd.DataFrame([features], columns=FEATURES)
    raw   = float(model.predict(X)[0])
    score = round(float(np.clip(raw, 1.0, 10.0)), 1)

    if   score >= 7.5: level = "Severe"
    elif score >= 5.5: level = "High"
    elif score >= 3.5: level = "Moderate"
    else:              level = "Low"

    return {
        "score":      score,
        "level":      level,
        "confidence": 0.90 if data.weatherCode == 800 else 0.78,
        "source":     "xgboost"
    }