const express = require("express");
const { createCoupon, getCoupons, validateCoupon, updateCoupon, deleteCoupon } = require("../controllers/couponController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { couponValidator, validateCouponValidator } = require("../validators/requestValidators");

const router = express.Router();

router.post("/validate", protect, validateCouponValidator, validateCoupon);
router.get("/", protect, authorizeRoles("admin", "manager"), getCoupons);
router.post("/", protect, authorizeRoles("admin", "manager"), couponValidator, createCoupon);
router.put("/:id", protect, authorizeRoles("admin", "manager"), updateCoupon);
router.delete("/:id", protect, authorizeRoles("admin"), deleteCoupon);

module.exports = router;
