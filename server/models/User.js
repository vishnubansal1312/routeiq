const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  googleId: { type: String, default: null },
  avatar:   { type: String, default: '' },
  plan:     { type: String, enum: ["free","pro","business"], default: "free" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);