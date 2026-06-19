const Expense = require("../models/expenseModel");
const Order = require("../models/orderModel");
const Employee = require("../models/employeeModel");
const MonthlyFinance = require("../models/MonthlyFinance");

const getRange = (req) => {
  const now = new Date();
  const from = req.query.from ? new Date(req.query.from) : new Date(now.getFullYear(), now.getMonth(), 1);
  const to = req.query.to ? new Date(req.query.to) : now;
  return { from, to };
};

const getFinanceSummary = async (req, res) => {
  try {
    const { from, to } = getRange(req);
    const [sales, expenseGroups, salaryResult] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: from, $lte: to }, status: { $ne: "cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$totalPrice" }, productRevenue: { $sum: "$subtotal" } } }
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: from, $lte: to } } },
        { $group: { _id: "$category", value: { $sum: "$amount" } } }
      ]),
      Employee.aggregate([
        { $match: { status: { $ne: "Inactive" } } },
        { $group: { _id: null, value: { $sum: "$salary" } } }
      ])
    ]);

    const financeRows = await MonthlyFinance.find().sort({ year: 1, monthNumber: 1 }).lean();
    const importedTotals = financeRows.reduce(
      (totals, row) => ({
        grossSales: totals.grossSales + (Number(row.grossSalesJd) || 0),
        discounts: totals.discounts + (Number(row.discountsJd) || 0),
        revenue: totals.revenue + (Number(row.netRevenueJd) || 0),
        cogs: totals.cogs + (Number(row.estimatedCostJd) || 0),
        profit: totals.profit + (Number(row.estimatedProfitJd) || 0),
        orders: totals.orders + (Number(row.orders) || 0),
        unitsSold: totals.unitsSold + (Number(row.unitsSold) || 0),
        pointsIssued: totals.pointsIssued + (Number(row.pointsIssued) || 0),
        pointsRedeemed: totals.pointsRedeemed + (Number(row.pointsRedeemed) || 0)
      }),
      { grossSales: 0, discounts: 0, revenue: 0, cogs: 0, profit: 0, orders: 0, unitsSold: 0, pointsIssued: 0, pointsRedeemed: 0 }
    );

    const revenue = sales[0]?.revenue || importedTotals.revenue;
    const expenses = Object.fromEntries(expenseGroups.map((item) => [item._id, item.value]));
    if (expenses.cogs === undefined && importedTotals.cogs) expenses.cogs = importedTotals.cogs;
    if (expenses.salaries === undefined) expenses.salaries = salaryResult[0]?.value || 0;
    const totalExpenses = Object.values(expenses).reduce((sum, value) => sum + value, 0);
    const cogs = expenses.cogs || 0;
    const grossProfit = revenue - cogs;
    const netProfit = revenue - totalExpenses;

    res.json({
      from,
      to,
      revenue,
      grossSales: importedTotals.grossSales || revenue,
      discounts: importedTotals.discounts,
      cogs,
      orders: importedTotals.orders,
      unitsSold: importedTotals.unitsSold,
      pointsIssued: importedTotals.pointsIssued,
      pointsRedeemed: importedTotals.pointsRedeemed,
      monthlyFinance: financeRows,
      expenses,
      totalExpenses,
      grossProfit,
      netProfit,
      profitMargin: revenue ? Number(((netProfit / revenue) * 100).toFixed(2)) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { from, to } = getRange(req);
    res.json(await Expense.find({ date: { $gte: from, $lte: to } }).populate("createdBy", "name").sort({ date: -1 }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createExpense = async (req, res) => {
  try {
    res.status(201).json(await Expense.create({ ...req.body, createdBy: req.user._id }));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after", runValidators: true });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFinanceSummary, getExpenses, createExpense, updateExpense, deleteExpense };
