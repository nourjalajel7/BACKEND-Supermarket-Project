const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    leadTime: { type: String, default: "2 days", trim: true },
    status: { type: String, enum: ["Active", "Priority", "Review", "Inactive"], default: "Active" },
    orderMultiple: { type: Number, default: 1, min: 1 },
    lastOrderAmount: { type: Number, default: 0, min: 0 },
    lastOrderAt: { type: Date },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
