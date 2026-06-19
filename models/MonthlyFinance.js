const mongoose = require("mongoose");

const monthlyFinanceSchema = new mongoose.Schema(
  {
    year: Number,
    monthNumber: Number,
    month: String,
    orders: Number,
    unitsSold: Number,
    grossSalesJd: Number,
    discountsJd: Number,
    netRevenueJd: Number,
    estimatedCostJd: Number,
    estimatedProfitJd: Number,
    pointsIssued: Number,
    pointsRedeemed: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("MonthlyFinance", monthlyFinanceSchema);