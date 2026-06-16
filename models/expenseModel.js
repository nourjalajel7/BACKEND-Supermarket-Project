const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["cogs", "salaries", "electricity", "rent", "delivery", "maintenance", "marketing", "tax", "other"],
      required: true
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
