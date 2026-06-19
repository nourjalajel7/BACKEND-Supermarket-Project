const mongoose = require("mongoose");

const customerLoyaltySchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, unique: true },
    customerName: String,
    joinDate: Date,
    loyaltyTier: String,
    pointsEarnedTotal: Number,
    pointsRedeemedTotal: Number,
    pointsBalance: Number,
    totalSpentJd: Number,
    visits2026Until0617: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerLoyalty", customerLoyaltySchema);