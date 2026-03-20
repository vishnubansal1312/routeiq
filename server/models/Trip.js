const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    origin: {
      label: String,
      lat: Number,
      lon: Number,
    },
    destination: {
      label: String,
      lat: Number,
      lon: Number,
    },
    routeType:      { type: String, enum: ["fastest", "shortest", "eco"], default: "fastest" },
    distance:       { type: Number },
    duration:       { type: Number },
    congestionScore:{ type: Number },
    congestionLevel:{ type: String, enum: ["Low", "Moderate", "High", "Severe"] },
    weather: {
      temp:      Number,
      condition: String,
      icon:      String,
    },
    tollCost:  { type: Number, default: 0 },
    fuelCost:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);