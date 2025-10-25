// gacha/pull_schema.js
const mongoose = require("mongoose");

const PullSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  rarity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

PullSchema.index({ rarity: 1 });
PullSchema.index({ timestamp: -1 });

module.exports = mongoose.model("GachaPull", PullSchema);
