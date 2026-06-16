const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Customer = require("../models/customerModel");

const getDashboardSummary = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStockList = await Product.find({ $expr: { $lte: ["$quantity", "$minimumStock"] } }).populate("categoryRef");
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalCustomers = await Customer.countDocuments();

    const salesResult = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, totalSales: { $sum: "$totalPrice" }, averageOrderValue: { $avg: "$totalPrice" } } }
    ]);

    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          name: { $first: "$products.name" },
          totalSold: { $sum: "$products.quantity" },
          revenue: { $sum: "$products.subtotal" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const monthlySales = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$products" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          orders: { $addToSet: "$_id" },
          unitsSold: { $sum: "$products.quantity" },
          revenue: { $sum: "$products.subtotal" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const salesByDay = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const categorySales = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDoc"
        }
      },
      { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$productDoc.categoryName", "$productDoc.category"] },
          value: { $sum: "$products.subtotal" },
          unitsSold: { $sum: "$products.quantity" }
        }
      },
      { $sort: { value: -1 } }
    ]);

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("products.product user customer");
    const totalSales = salesResult.length > 0 ? salesResult[0].totalSales : 0;
    const averageOrderValue = salesResult.length > 0 ? Number(salesResult[0].averageOrderValue.toFixed(2)) : 0;
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    res.json({
      totalProducts,
      lowStockProducts: lowStockList.length,
      totalOrders,
      totalUsers,
      totalCustomers,
      totalSales,
      averageOrderValue,
      lowStockList,
      topProducts,
      ordersByStatus,
      recentOrders,
      monthlySales: monthlySales.map((item) => ({
        name: item._id,
        orders: item.orders.length,
        unitsSold: item.unitsSold,
        revenue: item.revenue
      })),
      salesByDay: salesByDay.map((item) => ({
        name: dayNames[item._id - 1],
        orders: item.orders,
        revenue: item.revenue
      })),
      categorySales: categorySales.map((item) => ({
        name: item._id || "Uncategorized",
        value: item.value,
        unitsSold: item.unitsSold
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardSummary
};
