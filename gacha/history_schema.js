//history
const mongoose = require("mongoose");

const GachaHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  pulls: [
    {
      name: String,
      rarity: Number,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  totalPulls: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("GachaHistory", GachaHistorySchema);
