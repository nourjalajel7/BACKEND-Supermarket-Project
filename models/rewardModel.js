const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    points: { type: Number, required: true, min: 1 },
    type: { type: String, enum: ["fixed", "percent", "delivery"], required: true },
    value: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reward", rewardSchema);
