const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Customer = require("../models/customerModel");
const Coupon = require("../models/couponModel");
const Payment = require("../models/paymentModel");
const Notification = require("../models/notificationModel");
const Reward = require("../models/rewardModel");
const LoyaltyTransaction = require("../models/loyaltyTransactionModel");

const calculateDiscount = async (couponCode, subtotal) => {
  if (!couponCode) {
    return { discount: 0, coupon: null };
  }

  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

  if (!coupon) {
    throw new Error("Invalid coupon");
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new Error("Coupon expired");
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit reached");
  }

  return { discount: Number(((subtotal * coupon.discountPercent) / 100).toFixed(2)), coupon };
};

const buildOrderProducts = async (items) => {
  let subtotal = 0;
  const orderProducts = [];
  const touchedProducts = [];

  for (const item of items) {
    const productId = item.product || item.productId;
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      throw new Error("Product not found");
    }

    if (product.quantity < item.quantity) {
      throw new Error(`Not enough stock for ${product.name}`);
    }

    const unitPrice = Number((product.price * (1 - product.discountPercent / 100)).toFixed(2));
    const itemSubtotal = Number((unitPrice * item.quantity).toFixed(2));

    product.quantity -= item.quantity;
    product.soldCount += item.quantity;
    await product.save();

    touchedProducts.push({ product, quantity: item.quantity });
    orderProducts.push({
      product: product._id,
      name: product.name,
      barcode: product.barcode,
      price: unitPrice,
      quantity: item.quantity,
      subtotal: itemSubtotal
    });

    subtotal += itemSubtotal;

    if (product.quantity <= product.minimumStock) {
      await Notification.create({
        title: "Low stock product",
        message: `${product.name} reached low stock level`,
        type: "low_stock",
        product: product._id
      });
    }
  }

  return { orderProducts, subtotal: Number(subtotal.toFixed(2)), touchedProducts };
};

const rollbackStock = async (touchedProducts) => {
  for (const item of touchedProducts) {
    await Product.findByIdAndUpdate(item.product._id, { $inc: { quantity: item.quantity, soldCount: -item.quantity } });
  }
};

const createOrder = async (req, res) => {
  let touchedProducts = [];

  try {
    const {
      customerName,
      customer,
      products,
      paymentMethod = "cash",
      deliveryAddress,
      couponCode,
      rewardId,
      fulfillment = deliveryAddress ? "delivery" : "pickup",
      useCart = false
    } = req.body;
    let items = products;

    if (useCart || !items || items.length === 0) {
      const cart = await Cart.findOne({ user: req.user._id });
      items = cart ? cart.items : [];
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must contain products" });
    }

    const result = await buildOrderProducts(items);
    touchedProducts = result.touchedProducts;

    const { discount: couponDiscount, coupon } = await calculateDiscount(couponCode, result.subtotal);
    const deliveryFee = fulfillment === "delivery" ? Number(process.env.DELIVERY_FEE || 2) : 0;
    let reward;
    let rewardDiscount = 0;

    if (rewardId) {
      reward = await Reward.findOne({ _id: rewardId, isActive: true });
      if (!reward) throw new Error("Reward not found");
      if (req.user.loyaltyPoints < reward.points) throw new Error("Not enough loyalty points");

      if (reward.type === "fixed") rewardDiscount = Math.min(result.subtotal, reward.value);
      if (reward.type === "percent") rewardDiscount = result.subtotal * (reward.value > 1 ? reward.value / 100 : reward.value);
      if (reward.type === "delivery" && fulfillment === "delivery") rewardDiscount = Math.min(deliveryFee, reward.value);
    }

    const discount = Number((couponDiscount + rewardDiscount).toFixed(2));
    const totalPrice = Math.max(0, Number((result.subtotal + deliveryFee - discount).toFixed(2)));
    const paymentStatus = paymentMethod === "cash" ? "pending" : "paid";
    const status = paymentMethod === "cash" ? "pending" : "completed";

    const order = await Order.create({
      user: req.user._id,
      customer,
      customerName,
      products: result.orderProducts,
      subtotal: result.subtotal,
      discount,
      deliveryFee,
      totalPrice,
      paymentMethod,
      paymentStatus,
      status,
      deliveryAddress,
      fulfillment,
      deliveryStatus: fulfillment === "delivery" ? "preparing" : "not_required",
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
      reward: reward ? {
        rewardId: reward._id,
        title: reward.title,
        pointsSpent: reward.points,
        discount: Number(rewardDiscount.toFixed(2))
      } : undefined
    });

    if (paymentMethod === "card") {
      await Payment.create({
        order: order._id,
        user: req.user._id,
        amount: totalPrice,
        method: paymentMethod,
        status: "paid",
        transactionId: `CARD-${Date.now()}-${Math.floor(Math.random() * 10000)}`
      });
    }

    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save();
    }

    if (customer) {
      await Customer.findByIdAndUpdate(customer, { $inc: { loyaltyPoints: Math.floor(totalPrice), purchaseCount: 1, totalSpent: totalPrice } });
    }

    const earnedPoints = Math.floor(totalPrice);
    const pointsChange = earnedPoints - (reward?.points || 0);
    req.user.loyaltyPoints = Math.max(0, req.user.loyaltyPoints + pointsChange);
    req.user.membershipLevel = req.user.loyaltyPoints >= 1000 ? "Gold" : req.user.loyaltyPoints >= 500 ? "Silver" : "Bronze";
    await req.user.save();

    if (reward) {
      await LoyaltyTransaction.create({
        user: req.user._id,
        points: -reward.points,
        action: `Redeemed ${reward.title}`,
        reward: reward._id,
        order: order._id
      });
    }
    if (earnedPoints > 0) {
      await LoyaltyTransaction.create({
        user: req.user._id,
        points: earnedPoints,
        action: "Earned points from purchase",
        order: order._id
      });
    }

    if (useCart) {
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    }

    await Notification.create({
      title: "New order",
      message: `Order ${order._id} created`,
      type: "order",
      order: order._id
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
      loyalty: { points: req.user.loyaltyPoints, membershipLevel: req.user.membershipLevel, earnedPoints }
    });
  } catch (error) {
    if (touchedProducts.length) {
      await rollbackStock(touchedProducts);
    }

    res.status(400).json({ message: error.message });
  }
};

const getOrderTracking = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (!["admin", "manager", "employee"].includes(req.user.role)) filter.user = req.user._id;
    const order = await Order.findOne(filter).select("customerName fulfillment deliveryAddress deliveryStatus delivery createdAt updatedAt status");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.fulfillment !== "delivery") return res.status(400).json({ message: "This order is not a delivery order" });

    const statusOrder = ["preparing", "out_for_delivery", "delivered"];
    const activeIndex = statusOrder.indexOf(order.deliveryStatus);
    res.json({
      orderId: order._id,
      status: order.status,
      deliveryStatus: order.deliveryStatus,
      deliveryAddress: order.deliveryAddress,
      delivery: order.delivery,
      steps: statusOrder.map((status, index) => ({
        status,
        completed: index <= activeIndex,
        active: index === activeIndex
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const filter = ["admin", "manager", "employee"].includes(req.user.role) ? {} : { user: req.user._id };
    const orders = await Order.find(filter).populate("products.product user customer").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    if (!["admin", "manager", "employee"].includes(req.user.role)) {
      filter.user = req.user._id;
    }

    const order = await Order.findOne(filter).populate("products.product user customer");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, deliveryStatus, paymentStatus, delivery } = req.body;
    const update = {};

    if (status) update.status = status;
    if (deliveryStatus) update.deliveryStatus = deliveryStatus;
    if (paymentStatus) update.paymentStatus = paymentStatus;
    if (delivery) update.delivery = { ...delivery, updatedAt: new Date() };

    const order = await Order.findByIdAndUpdate(req.params.id, update, { returnDocument: "after", runValidators: true });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order updated", order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    if (!["admin", "manager", "employee"].includes(req.user.role)) {
      filter.user = req.user._id;
    }

    const order = await Order.findOne(filter);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, { $inc: { quantity: item.quantity, soldCount: -item.quantity } });
    }

    order.status = "cancelled";
    order.paymentStatus = order.paymentStatus === "paid" ? "refunded" : order.paymentStatus;
    await order.save();

    res.json({ message: "Order cancelled", order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderTracking
};
