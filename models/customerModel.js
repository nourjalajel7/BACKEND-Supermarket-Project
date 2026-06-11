const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, trim: true },
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    purchaseCount: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
    favoriteCategory: { type: String, default: "General", trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
