const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Customer = require("../models/customerModel");

const dateFilter = (req) => {
  const match = { status: { $ne: "cancelled" } };
  if (req.query.from || req.query.to) {
    match.createdAt = {};
    if (req.query.from) match.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) match.createdAt.$lte = new Date(req.query.to);
  }
  return match;
};

const getSalesReport = async (req, res) => {
  try {
    const match = dateFilter(req);
    const [summary, daily, monthly, categories, topProducts] = await Promise.all([
      Order.aggregate([
        { $match: match },
        { $group: { _id: null, revenue: { $sum: "$totalPrice" }, transactions: { $sum: 1 }, averageTransaction: { $avg: "$totalPrice" } } }
      ]),
      Order.aggregate([
        { $match: match },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, sales: { $sum: "$subtotal" }, customers: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        { $match: match },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, transactions: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        { $match: match },
        { $unwind: "$products" },
        { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "catalogProduct" } },
        { $unwind: { path: "$catalogProduct", preserveNullAndEmptyArrays: true } },
        { $group: { _id: { $ifNull: ["$catalogProduct.categoryName", "General"] }, revenue: { $sum: "$products.subtotal" }, quantity: { $sum: "$products.quantity" } } },
        { $sort: { revenue: -1 } }
      ]),
      Order.aggregate([
        { $match: match },
        { $unwind: "$products" },
        { $group: { _id: "$products.product", name: { $first: "$products.name" }, quantity: { $sum: "$products.quantity" }, revenue: { $sum: "$products.subtotal" } } },
        { $sort: { quantity: -1 } },
        { $limit: 10 }
      ])
    ]);

    const totals = summary[0] || { revenue: 0, transactions: 0, averageTransaction: 0 };
    res.json({
      summary: { ...totals, averageTransaction: Number((totals.averageTransaction || 0).toFixed(2)) },
      daily: daily.map((item) => ({ name: item._id, revenue: item.revenue, sales: item.sales, customers: item.customers })),
      monthly: monthly.map((item) => ({ name: item._id, revenue: item.revenue, transactions: item.transactions })),
      categories: categories.map((item) => ({ name: item._id, value: item.revenue, quantity: item.quantity })),
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomerInsights = async (req, res) => {
  try {
    const [customers, totalProducts, repeatCustomers] = await Promise.all([
      Customer.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Customer.countDocuments({ purchaseCount: { $gte: 2 } })
    ]);
    res.json({
      totalCustomers: customers,
      activeProducts: totalProducts,
      repeatCustomers,
      repeatRate: customers ? Number(((repeatCustomers / customers) * 100).toFixed(1)) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSalesReport, getCustomerInsights, dateFilter };
