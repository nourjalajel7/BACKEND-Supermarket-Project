const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ["order", "low_stock", "system"], default: "system" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
