const mongoose = require("mongoose");

const loyaltyTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    points: { type: Number, required: true },
    action: { type: String, required: true, trim: true },
    reward: { type: mongoose.Schema.Types.ObjectId, ref: "Reward" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoyaltyTransaction", loyaltyTransactionSchema);
