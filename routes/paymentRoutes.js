const express = require("express");
const { createPayment, getPayments } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const { paymentValidator } = require("../validators/requestValidators");

const router = express.Router();

router.use(protect);
router.post("/", paymentValidator, createPayment);
router.get("/", getPayments);

module.exports = router;
