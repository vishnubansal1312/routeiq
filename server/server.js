require("dotenv").config();
const express = require("express");
const http    = require("http");
const { Server } = require("socket.io");
const mongoose   = require("mongoose");
const cors       = require("cors");

const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");
const apiRoutes  = require("./routes/api");

const app    = express();
const server = http.createServer(app);

// ── Socket.io ──────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const activeUsers = {};
let userCount = 0;

io.on("connection", (socket) => {
  userCount++;
  io.emit("activeUsers", userCount);

  // Share live location with other users
  socket.on("shareLocation", (data) => {
    socket.broadcast.emit("userLocation", {
      id:    socket.id,
      name:  data.name  || "Anonymous",
      lat:   data.lat,
      lon:   data.lon,
      route: data.route || null,
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

// ── Middleware ─────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://routeiq-gilt.vercel.app",
    /\.vercel\.app$/,
  ],
  credentials: true,
}));
app.use(express.json());

// ── MongoDB ────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

// ── Routes ─────────────────────────────────────────────────────────
app.use("/api/auth",  authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api",       apiRoutes);

app.get("/", (req, res) => res.json({ message: "RouteIQ API running ✅" }));

// ── Start ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
