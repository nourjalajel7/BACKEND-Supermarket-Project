const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerName: { type: String, default: "Walk-in Customer", trim: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        barcode: { type: String },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        subtotal: { type: Number, required: true, min: 0 }
      }
    ],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["cash", "fake_card"], default: "cash" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    deliveryAddress: { type: String, trim: true },
    fulfillment: { type: String, enum: ["pickup", "delivery"], default: "pickup" },
    deliveryStatus: { type: String, enum: ["not_required", "preparing", "out_for_delivery", "delivered"], default: "not_required" },
    delivery: {
      driverName: { type: String, trim: true },
      driverPhone: { type: String, trim: true },
      vehicle: { type: String, trim: true },
      estimatedArrival: { type: Date },
      latitude: { type: Number },
      longitude: { type: Number },
      updatedAt: { type: Date }
    },
    status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
    couponCode: { type: String, trim: true },
    reward: {
      rewardId: { type: mongoose.Schema.Types.ObjectId, ref: "Reward" },
      title: { type: String, trim: true },
      pointsSpent: { type: Number, min: 0 },
      discount: { type: Number, min: 0 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
