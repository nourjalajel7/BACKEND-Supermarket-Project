const Review = require("../models/reviewModel");
const Product = require("../models/productModel");

const refreshProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: "$product", averageRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } }
  ]);

  await Product.findByIdAndUpdate(productId, {
    averageRating: stats.length ? Number(stats[0].averageRating.toFixed(1)) : 0,
    reviewCount: stats.length ? stats[0].reviewCount : 0
  });
};

const createReview = async (req, res) => {
  try {
    const review = await Review.findOneAndUpdate(
      { user: req.user._id, product: req.body.product },
      { rating: req.body.rating, comment: req.body.comment },
      { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    await refreshProductRating(review.product);
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate("user", "name").sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    if (!["admin", "manager"].includes(req.user.role)) {
      filter.user = req.user._id;
    }

    const review = await Review.findOneAndDelete(filter);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await refreshProductRating(review.product);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  deleteReview
};
