const Order = require("../models/orderModel");
const Payment = require("../models/paymentModel");

const createPayment = async (req, res) => {
  try {
    const { orderId, method = "fake_card" } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    if (!["cash", "fake_card"].includes(method)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const filter = { _id: orderId };

    if (!["admin", "manager", "employee"].includes(req.user.role)) {
      filter.user = req.user._id;
    }

    const order = await Order.findOne(filter);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Cancelled order cannot be paid" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order is already paid" });
    }

    const payment = await Payment.create({
      order: order._id,
      user: req.user._id,
      amount: order.totalPrice,
      method,
      status: method === "cash" ? "pending" : "paid",
      transactionId: method === "cash" ? undefined : `SIM-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    });

    order.paymentMethod = method;
    order.paymentStatus = payment.status;
    order.status = payment.status === "paid" ? "completed" : order.status;
    await order.save();

    res.status(201).json({ message: "Payment processed", payment, order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const filter = ["admin", "manager", "employee"].includes(req.user.role) ? {} : { user: req.user._id };
    const payments = await Payment.find(filter).populate("order user").sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPayment,
  getPayments
};
