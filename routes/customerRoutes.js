const express = require("express");
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  updateCustomerPoints
} = require("../controllers/customerController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { customerValidator, customerPointsValidator } = require("../validators/requestValidators");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin", "manager", "employee"));
router.post("/", customerValidator, createCustomer);
router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer);
router.put("/:id/points", customerPointsValidator, updateCustomerPoints);
router.delete("/:id", authorizeRoles("admin", "manager"), deleteCustomer);

module.exports = router;
