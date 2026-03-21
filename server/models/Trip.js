const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  origin:         { label: String, lat: Number, lon: Number },
  destination:    { label: String, lat: Number, lon: Number },
  routeType:      { type: String, default: "fastest" },
  distance:       { type: Number, default: 0 },
  duration:       { type: Number, default: 0 },
  congestionScore:{ type: Number, default: 5 },
  congestionLevel:{ type: String, default: "Moderate" },
  weather:        { temp: Number, condition: String, icon: String },
  tollCost:       { type: Number, default: 0 },
  fuelCost:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Trip", tripSchema);