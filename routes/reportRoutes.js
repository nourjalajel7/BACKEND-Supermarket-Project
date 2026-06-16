const express = require("express");
const { getSalesReport, getCustomerInsights } = require("../controllers/reportController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect, authorizeRoles("admin", "manager"));
router.get("/sales", getSalesReport);
router.get("/customers", getCustomerInsights);

module.exports = router;
