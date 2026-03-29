# RouteIQ — Teaching Machines to Navigate India's Chaos 🗺️

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-routeiq--gilt.vercel.app-6d28d9?style=for-the-badge)](https://routeiq-gilt.vercel.app)
[![Backend](https://img.shields.io/badge/⚙️_Backend-Render-00979D?style=for-the-badge)](https://routeiq-server.onrender.com)
[![ML Service](https://img.shields.io/badge/🤖_ML_API-FastAPI-009688?style=for-the-badge)](https://routeiq-ml.onrender.com)
[![GitHub](https://img.shields.io/badge/⭐_Star_this_repo-GitHub-181717?style=for-the-badge)](https://github.com/vishnubansal1312/routeiq)

**AI-powered real-time traffic navigation built for Indian roads.**
Predict congestion before you leave. Navigate with voice. Track your fleet live.

</div>

---

## What is RouteIQ?

RouteIQ is a production-deployed, full-stack AI traffic intelligence platform designed specifically for Indian road conditions. It combines machine learning congestion prediction, real-time GPS navigation, live weather alerts, fleet management and Google OAuth — all in one app.

Built as a Progressive Web App (PWA), it works on all devices and can be installed directly on mobile.

---

## Live Demo

| Service | URL | Status |
|---|---|---|
| Frontend | https://routeiq-gilt.vercel.app | ✅ Live |
| Backend API | https://routeiq-server.onrender.com | ✅ Live |
| ML Service | https://routeiq-ml.onrender.com | ✅ Live |

> **Note:** Render free tier sleeps after 15 min of inactivity. First request may take 30–60 seconds to wake up.

---

## Features

### 🧠 AI & Machine Learning
- **XGBoost Congestion Prediction** — Trained ML model predicts traffic congestion score (0–10) with 99% accuracy
- **Best Departure Time AI** — Analyses all 24 hours of the day and recommends the optimal time to leave
- **Accident Hotspot Detection** — 20+ known danger zones across India mapped and highlighted on route
- **Carbon Footprint Score** — Calculates CO₂ emissions per route and assigns an eco score

### 🗺️ Navigation
- **3-Route Comparison** — Fastest, Shortest and Eco routes shown simultaneously on map
- **Live GPS Navigation** — Real-time turn-by-turn voice navigation with auto step-advance based on cumulative distance tracking
- **Street-Level Map** — Switches to detailed street view with road names during navigation
- **Voice Announcements** — Speaks every turn instruction in English (Indian accent) with early 150m warning
- **Re-center on me** — Map follows your GPS dot during navigation

### 🌤️ Real-Time Data
- **Live Weather Alerts** — Rain, fog and storm warnings at destination via OpenWeatherMap
- **Live Traffic Incidents** — Real-time accidents and road closures via TomTom Traffic API
- **Places Along Route** — Find petrol stations, hospitals, food and ATMs along your route
- **Live User Counter** — Shows how many users are online right now via Socket.io

### 🚛 Fleet Management
- **Live Vehicle Tracking** — Track up to 50 vehicles with GPS coordinates updating every 10 seconds
- **Fuel Monitoring** — Real-time fuel level with low-fuel alerts
- **Route Progress** — Distance covered vs total distance for each vehicle
- **Driver Analytics** — Speed, ETA and driver name for every vehicle
- **Mobile Responsive** — Fleet dashboard works on all screen sizes with tab-based map/list view

### 🔐 Authentication
- **Google OAuth 2.0** — One-click sign in with Google
- **JWT Authentication** — Secure email/password login with 7-day token expiry
- **Protected Routes** — All app pages require authentication

### 📊 Dashboard & Analytics
- **Interactive Charts** — Hourly congestion patterns and weekly activity via Recharts
- **Trip History** — All past trips with search, filter and delete
- **Congestion Distribution** — Visual breakdown of Low/Moderate/High/Severe trips
- **Route Preferences** — Analytics on which route type you use most

### 💳 Pricing & Subscriptions
- **3 Plans** — Free, Pro (₹499/mo), Business (₹1,499/mo)
- **Annual/Monthly Toggle** — 20% discount on annual billing
- **Feature Comparison Table** — Full breakdown of what each plan includes
- **FAQ Section** — Accordion-style FAQs

### 📱 PWA
- **Installable** — Add to home screen on Android and iOS
- **Offline Support** — Service worker caches the app shell
- **Mobile Responsive** — Fully optimised for all screen sizes

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js + Vite | UI framework and build tool |
| Leaflet.js | Interactive maps and route rendering |
| Recharts | Dashboard charts and analytics |
| Socket.io-client | Real-time live GPS sharing |
| React Router v6 | Client-side routing |
| Axios | HTTP client for API calls |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API server |
| Socket.io | Real-time bidirectional events |
| Passport.js | Google OAuth 2.0 strategy |
| JWT | Stateless authentication tokens |
| Mongoose | MongoDB object modeling |
| MongoDB Atlas | Cloud database |

### ML Service
| Technology | Purpose |
|---|---|
| Python + FastAPI | ML model serving |
| XGBoost | Congestion prediction model |
| Scikit-learn | Model training and evaluation |
| Pandas + NumPy | Data processing |
| Joblib | Model serialisation |

### APIs & Services
| API | Purpose |
|---|---|
| TomTom Maps API | Autocomplete, routing, traffic incidents |
| OpenWeatherMap API | Real-time weather at destination |
| OpenRouteService API | Alternative routing engine |
| Google OAuth 2.0 | Social authentication |

### DevOps & Deployment
| Tool | Purpose |
|---|---|
| Vercel | Frontend deployment with CI/CD |
| Render | Backend and ML service hosting |
| GitHub | Version control and CI/CD trigger |
| MongoDB Atlas | Cloud database hosting |

---

## Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                         │
│              Vercel — routeiq-gilt.vercel.app                 │
└──────────────────────────┬────────────────────────────────────┘
                           │  REST API + Socket.io
                           ▼
┌───────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js)                           │
│            Render — routeiq-server.onrender.com               │
│                                                               │
│   ┌─────────────┐   ┌──────────────┐   ┌──────────────────┐  │
│   │  Auth API   │   │  Trips API   │   │   Routes API     │  │
│   │  JWT+Google │   │  CRUD trips  │   │  TomTom + ORS    │  │
│   └─────────────┘   └──────────────┘   └──────────────────┘  │
│                                                               │
│   ┌─────────────────────────────────────────────────────┐    │
│   │              Socket.io Server                        │    │
│   │   Live GPS sharing · Active user counter            │    │
│   └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬────────────────────────────────────┘
              │            │
              ▼            ▼
┌─────────────────┐  ┌─────────────────────────────────────────┐
│  MongoDB Atlas  │  │         ML Service (Python)             │
│  Cloud Database │  │    Render — routeiq-ml.onrender.com     │
│                 │  │                                         │
│  · Users        │  │   FastAPI + XGBoost                     │
│  · Trips        │  │   POST /predict → congestion score      │
└─────────────────┘  └─────────────────────────────────────────┘
```

---

## Project Structure

```
RouteIQ/
│
├── client/                          # React + Vite frontend
│   ├── public/
│   │   ├── manifest.json            # PWA manifest
│   │   └── sw.js                    # Service worker
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx          # Public landing page
│   │   │   ├── Login.jsx            # Email + Google login
│   │   │   ├── Signup.jsx           # Registration page
│   │   │   ├── MapPage.jsx          # Main map + navigation
│   │   │   ├── Dashboard.jsx        # Analytics dashboard
│   │   │   ├── History.jsx          # Trip history
│   │   │   ├── Fleet.jsx            # Fleet management
│   │   │   ├── Pricing.jsx          # Subscription plans
│   │   │   └── AuthCallback.jsx     # Google OAuth callback
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top navigation bar
│   │   │   ├── LiveNavigation.jsx   # Turn-by-turn navigation UI
│   │   │   ├── Directions.jsx       # Step list component
│   │   │   ├── RouteComparison.jsx  # 3-route cards
│   │   │   ├── ChatAssistant.jsx    # AI chat floating button
│   │   │   ├── CarbonFootprint.jsx  # CO₂ score per route
│   │   │   ├── DepartureTime.jsx    # Best time to leave chart
│   │   │   ├── AccidentHotspots.jsx # Danger zone markers
│   │   │   ├── TrafficIncidents.jsx # Live incident layer
│   │   │   ├── PlacesAlongRoute.jsx # POI along route
│   │   │   └── LiveSharing.jsx      # GPS sharing via Socket.io
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state
│   │   └── utils/
│   │       └── api.js               # Axios instance with auth
│   ├── vite.config.js
│   └── vercel.json                  # SPA routing fix for Vercel
│
├── server/                          # Node.js + Express backend
│   ├── models/
│   │   ├── User.js                  # User schema (JWT + Google)
│   │   └── Trip.js                  # Trip schema
│   ├── routes/
│   │   ├── auth.js                  # Login, signup, token refresh
│   │   ├── trips.js                 # CRUD for trip history
│   │   └── api.js                   # Routes, weather, predict proxy
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   └── server.js                    # Express + Socket.io + Passport
│
└── ml/                              # Python ML service
    ├── main.py                      # FastAPI app + XGBoost model
    ├── requirements.txt             # Python dependencies
    └── runtime.txt                  # Python 3.11.0
```

---

## ML Model Details

The congestion prediction model was trained on features combining time, weather and location data.

### Input Features

| Feature | Description |
|---|---|
| `hour` | Hour of day (0–23) |
| `dayOfWeek` | Day of week (0=Monday) |
| `month` | Month (1–12) |
| `weatherCode` | OpenWeatherMap condition code |
| `temp` | Temperature in °C |
| `humidity` | Humidity percentage |
| `windSpeed` | Wind speed in m/s |
| `visibility` | Visibility in km |
| `distance` | Route distance in km |
| `originLat/Lon` | Origin coordinates |
| `destLat/Lon` | Destination coordinates |

### Model Performance

| Metric | Value |
|---|---|
| Algorithm | XGBoost Gradient Boosting |
| Prediction Accuracy | 99% |
| Mean Absolute Error | 0.679 |
| Output | Congestion score (0–10) + Level (Low/Moderate/High/Severe) |
| Avg Response Time | < 200ms |

---

## Getting Started Locally

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB Atlas free cluster
- TomTom API key (free at developer.tomtom.com)
- OpenWeatherMap API key (free at openweathermap.org)

### 1. Clone the repository

```bash
git clone https://github.com/vishnubansal1312/routeiq.git
cd routeiq
```

### 2. Setup the ML service

```bash
cd ml
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Setup the backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5001
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key
TOMTOM_API_KEY=your_tomtom_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
ML_API_URL=http://localhost:8000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
SESSION_SECRET=your_session_secret
CLIENT_URL=http://localhost:5173
```

```bash
node server.js
```

### 4. Setup the frontend

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5001
```

```bash
npm run dev
```

### 5. Open the app

Visit `http://localhost:5173` — the full app is running locally!

---

## Deployment

### Frontend → Vercel

```bash
# Connect GitHub repo to Vercel
# Root directory: client
# Build command: npm run build
# Output directory: dist
# Environment variable: VITE_API_URL = https://your-backend.onrender.com
```

### Backend → Render

```
Root directory: server
Build command: npm install
Start command: node server.js
Add all .env variables in Render dashboard
```

### ML Service → Render

```
Root directory: ml
Runtime: Python 3
Build command: pip install -r requirements.txt
Start command: uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register with email/password |
| POST | `/api/auth/login` | Login with email/password |
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |

### Routes & Navigation
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/routes/all` | Get all 3 routes (fastest, shortest, eco) |
| GET | `/api/weather` | Get weather at destination |
| POST | `/api/predict` | Get ML congestion prediction |

### Trips
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips` | Get all trips for logged in user |
| POST | `/api/trips` | Save a new trip |
| DELETE | `/api/trips/:id` | Delete a trip |

### ML Service
| Method | Endpoint | Description |
|---|---|---|
| POST | `/predict` | Predict congestion score from features |
| GET | `/health` | Health check |

---

## Socket.io Events

| Event | Direction | Description |
|---|---|---|
| `activeUsers` | Server → Client | Broadcast current online user count |
| `shareLocation` | Client → Server | Share user GPS coordinates |
| `stopSharing` | Client → Server | Stop sharing location |
| `userLocation` | Server → Client | Receive another user's location |
| `userLeft` | Server → Client | User stopped sharing |

---

## Screenshots

> Visit the live app at **[routeiq-gilt.vercel.app](https://routeiq-gilt.vercel.app)**

| Page | Description |
|---|---|
| Landing | Professional landing page with animated route map visual |
| Login/Signup | Split-screen with Google OAuth and email login |
| Map | Dark map with 3 coloured routes, sidebar, live GPS |
| Navigation | Google Maps-style turn-by-turn with speed display |
| Dashboard | Analytics with Recharts, trip stats, congestion charts |
| Fleet | Live vehicle tracking with fuel and progress bars |
| Pricing | 3-tier pricing with annual/monthly toggle and FAQ |

---

## Roadmap

- [ ] Real Razorpay payment integration
- [ ] Auto re-routing when user deviates from route
- [ ] Multi-stop route planning
- [ ] Favourite routes
- [ ] Push notifications for traffic alerts
- [ ] Weekly email trip summary reports
- [ ] User profile page with avatar and usage stats
- [ ] Public REST API for Business plan users
- [ ] Route sharing link (routeiq.app/r/abc123)
- [ ] Admin dashboard with user and revenue analytics

---

## Author

**Vishu Bansal**
- GitHub: [@vishnubansal1312](https://github.com/vishnubansal1312)
- Live App: [routeiq-gilt.vercel.app](https://routeiq-gilt.vercel.app)

---

## License

MIT License — feel free to use this project for learning and inspiration.

---

<div align="center">
  <strong>If this project helped you, please give it a ⭐ on GitHub!</strong>
  <br><br>
  Built with ❤️ for India 🇮🇳
</div>
