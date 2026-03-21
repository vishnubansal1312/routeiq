require("dotenv").config();
const express  = require("express");
const http     = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors     = require("cors");
const session  = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt      = require("jsonwebtoken");

const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");
const apiRoutes  = require("./routes/api");
const User       = require("./models/User");

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST"] }
});

let userCount = 0;
const activeUsers = {};

io.on("connection", (socket) => {
  userCount++;
  io.emit("activeUsers", userCount);

  socket.on("shareLocation", (data) => {
    socket.broadcast.emit("userLocation", {
      id: socket.id, name: data.name || "Anonymous",
      lat: data.lat, lon: data.lon, route: data.route || null,
    });
    activeUsers[socket.id] = { ...data, id: socket.id };
  });

  socket.on("stopSharing", () => {
    delete activeUsers[socket.id];
    socket.broadcast.emit("userLeft", socket.id);
  });

  socket.on("disconnect", () => {
    userCount--;
    io.emit("activeUsers", userCount);
    delete activeUsers[socket.id];
    socket.broadcast.emit("userLeft", socket.id);
  });
});

app.set("io", io);

// ── Middleware ──────────────────────────────────────────────────────
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "routeiq_session_2026",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// ── MongoDB ─────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err.message));

// ── Google OAuth Strategy ───────────────────────────────────────────
passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: profile.emails[0].value });

    if (!user) {
      // Create new user from Google profile
      user = new User({
        name:       profile.displayName,
        email:      profile.emails[0].value,
        password:   `google_${profile.id}`, // placeholder password
        googleId:   profile.id,
        avatar:     profile.photos?.[0]?.value || '',
        plan:       'free',
      });
      await user.save();
    } else if (!user.googleId) {
      // Link Google to existing account
      user.googleId = profile.id;
      user.avatar   = profile.photos?.[0]?.value || user.avatar;
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done)   => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err, null);
  }
});

// ── Google Auth Routes ──────────────────────────────────────────────
app.get("/api/auth/google",
  passport.authenticate("google", { scope: ["profile","email"] })
);

app.get("/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed` }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const user = {
      id:    req.user._id,
      name:  req.user.name,
      email: req.user.email,
      plan:  req.user.plan || 'free',
      avatar: req.user.avatar || '',
    };
    // Redirect to frontend with token
    const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientURL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
  }
);

// ── Routes ──────────────────────────────────────────────────────────
app.use("/api/auth",  authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api",       apiRoutes);

app.get("/", (req, res) => res.json({ message: "RouteIQ API running ✅" }));

// ── Start ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));