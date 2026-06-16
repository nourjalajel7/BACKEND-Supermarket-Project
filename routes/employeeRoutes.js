const express = require("express");
const {
  getEmployees,
  getEmployeeSummary,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require("../controllers/employeeController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { employeeValidator } = require("../validators/requestValidators");

const router = express.Router();
router.use(protect, authorizeRoles("admin", "manager"));
router.get("/", getEmployees);
router.get("/summary", getEmployeeSummary);
router.post("/", employeeValidator, createEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", authorizeRoles("admin"), deleteEmployee);

module.exports = router;
