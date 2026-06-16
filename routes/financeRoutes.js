const express = require("express");
const {
  getFinanceSummary,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} = require("../controllers/financeController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { expenseValidator } = require("../validators/requestValidators");

const router = express.Router();
router.use(protect, authorizeRoles("admin", "manager"));
router.get("/summary", getFinanceSummary);
router.get("/expenses", getExpenses);
router.post("/expenses", expenseValidator, createExpense);
router.put("/expenses/:id", updateExpense);
router.delete("/expenses/:id", deleteExpense);

module.exports = router;
