const mongoose = require("mongoose");

const PullSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  username: { type: String }, //opt
  name: { type: String, required: true },
  rarity: { type: Number, required: true },
  banner: { type: String },       
  bannerKey: { type: String },     
  featured5Star: { type: String }, 
  featured4Stars: [{ type: String }], 

  timestamp: { type: Date, default: Date.now },
});

PullSchema.index({ rarity: 1 });
PullSchema.index({ timestamp: -1 });

module.exports = mongoose.model("GachaPull", PullSchema);

