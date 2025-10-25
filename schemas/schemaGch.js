// models/UserGacha.js
const mongoose = require("mongoose");

const userGachaSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  pity5: { type: Number, default: 0 },
  pity4: { type: Number, default: 0 },
  guaranteed5Star: { type: Boolean, default: false },
  guaranteed4Star: { type: Boolean, default: false }
});

module.exports = mongoose.model("UserGacha", userGachaSchema);
