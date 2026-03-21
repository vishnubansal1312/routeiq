const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const Trip    = require("../models/Trip");

// Get all trips for logged in user
router.get("/", auth, async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ trips });
  } catch (err) {
    console.error("Get trips error:", err.message);
    res.status(500).json({ error: "Failed to get trips" });
  }
});

// Save a trip
router.post("/", auth, async (req, res) => {
  try {
    const {
      origin, destination, routeType, distance, duration,
      congestionScore, congestionLevel, weather, tollCost, fuelCost,
    } = req.body;

    const trip = new Trip({
      user:           req.userId,
      origin,
      destination,
      routeType:      routeType || "fastest",
      distance:       parseFloat(distance) || 0,
      duration:       parseFloat(duration) || 0,
      congestionScore: parseFloat(congestionScore) || 5,
      congestionLevel: congestionLevel || "Moderate",
      weather:        weather || {},
      tollCost:       parseFloat(tollCost) || 0,
      fuelCost:       parseFloat(fuelCost) || 0,
    });

    await trip.save();
    res.status(201).json({ trip });
  } catch (err) {
    console.error("Save trip error:", err.message);
    res.status(500).json({ error: "Failed to save trip" });
  }
});

// Delete a trip
router.delete("/:id", auth, async (req, res) => {
  try {
    await Trip.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete trip" });
  }
});

module.exports = router;