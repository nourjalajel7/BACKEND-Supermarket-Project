const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    barcode: { type: String, required: true, unique: true, trim: true },
    category: { type: String, default: "General", trim: true },
    categoryRef: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    categoryName: { type: String, default: "General", trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    healthTags: [{ type: String, lowercase: true, trim: true }],
    sugarGrams: { type: Number, default: 0, min: 0 },
    sodiumMg: { type: Number, default: 0, min: 0 },
    nutritionGrade: { type: String, enum: ["A", "B", "C", "D", "E"], default: "B" },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    minimumStock: { type: Number, default: 10, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    isActive: { type: Boolean, default: true },
    soldCount: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
