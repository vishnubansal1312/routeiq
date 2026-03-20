const express = require("express");
const router  = express.Router();
const Trip    = require("../models/Trip");
const protect = require("../middleware/auth");

router.post("/", protect, async (req, res) => {
  try {
    const trip = await new Trip({ userId: req.user._id, ...req.body }).save();
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: "Error saving trip" });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: "Error fetching trips" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json({ message: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting trip" });
  }
});

router.get("/stats", protect, async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user._id });
    const totalTrips    = trips.length;
    const totalDistance = trips.reduce((s, t) => s + (t.distance || 0), 0).toFixed(1);
    const avgCongestion = totalTrips
      ? (trips.reduce((s, t) => s + (t.congestionScore || 0), 0) / totalTrips).toFixed(1)
      : 0;
    const totalFuelCost = trips.reduce((s, t) => s + (t.fuelCost || 0), 0).toFixed(0);
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const ht = trips.filter(t => new Date(t.createdAt).getHours() === hour);
      return {
        hour: `${hour}:00`,
        congestion: ht.length
          ? (ht.reduce((s, t) => s + (t.congestionScore || 0), 0) / ht.length).toFixed(1)
          : (Math.random() * 4 + 1).toFixed(1),
      };
    });
    res.json({ totalTrips, totalDistance, avgCongestion, totalFuelCost, hourlyData });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

module.exports = router;