const express = require("express");
const { createOrder, getOrders, getOrderById, updateOrderStatus, cancelOrder, getOrderTracking } = require("../controllers/orderController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { createOrderValidator, updateOrderStatusValidator } = require("../validators/requestValidators");

const router = express.Router();

router.use(protect);
router.post("/", createOrderValidator, createOrder);
router.get("/", getOrders);
router.get("/:id/tracking", getOrderTracking);
router.get("/:id", getOrderById);
router.put("/:id/status", authorizeRoles("admin", "manager", "employee"), updateOrderStatusValidator, updateOrderStatus);
router.put("/:id/cancel", cancelOrder);

module.exports = router;
