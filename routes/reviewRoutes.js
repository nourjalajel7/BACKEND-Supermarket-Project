const express = require("express");
const { createReview, getProductReviews, deleteReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");
const { reviewValidator } = require("../validators/requestValidators");

const router = express.Router();

router.get("/product/:productId", protect, getProductReviews);
router.post("/", protect, reviewValidator, createReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
