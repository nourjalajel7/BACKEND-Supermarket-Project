const express = require("express");
const { getDashboardSummary } = require("../controllers/dashboardController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorizeRoles("admin", "manager"), getDashboardSummary);

module.exports = router;
