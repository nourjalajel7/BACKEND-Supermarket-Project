const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const { getAssociationRecommendations } = require("../services/associationRecommendationService");
const { predictStockWithForecastApi } = require("../services/inventoryForecastService");

const getInventoryPredictions = async (req, res) => {
  try {
    const products = await Product.find().populate("categoryRef");
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sales = await Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: "cancelled" } } },
      { $unwind: "$products" },
      { $group: { _id: "$products.product", sold: { $sum: "$products.quantity" } } }
    ]);

    const salesMap = new Map(sales.map((item) => [item._id.toString(), item.sold]));

    const predictions = products.map((product) => {
      const monthlySold = salesMap.get(product._id.toString()) || product.soldCount || 0;
      const averageDailySales = Math.max(monthlySold / 30, 1);
      const estimatedDaysLeft = Math.ceil(product.quantity / averageDailySales);
      const isLowStock = product.quantity <= product.minimumStock;
      const recommendedReorderQuantity = isLowStock || estimatedDaysLeft <= 7 ? Math.max(product.minimumStock * 3 - product.quantity, Math.ceil(averageDailySales * 14)) : 0;
      let message = "Stock level is good";

      if (estimatedDaysLeft <= 3) {
        message = "Product may run out soon";
      } else if (isLowStock || estimatedDaysLeft <= 7) {
        message = "Reorder soon";
      }

      return {
        productId: product._id,
        productName: product.name,
        barcode: product.barcode,
        category: product.categoryName,
        currentQuantity: product.quantity,
        minimumStock: product.minimumStock,
        averageDailySales: Number(averageDailySales.toFixed(2)),
        estimatedDaysLeft,
        isLowStock,
        recommendedReorderQuantity,
        message
      };
    });

    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const predictStock = async (req, res) => {
  try {
    const prediction = await predictStockWithForecastApi(req.body);
    res.json(prediction);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
      errors: error.errors
    });
  }
};

const recommendProducts = async (req, res) => {
  try {
    const recommendations = await getAssociationRecommendations(req.body);
    res.json(recommendations);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
      errors: error.errors
    });
  }
};

module.exports = {
  getInventoryPredictions,
  recommendProducts,
  predictStock
};
