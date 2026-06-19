const mongoose = require("mongoose");

const seasonEventSchema = new mongoose.Schema(
  {
    seasonEvent: String,
    dateWindowUsed: String,
    productsBoosted: [String],
    whyItMatters: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeasonEvent", seasonEventSchema);