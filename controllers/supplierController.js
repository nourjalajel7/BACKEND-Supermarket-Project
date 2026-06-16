const Supplier = require("../models/supplierModel");
const Product = require("../models/productModel");

const getSuppliers = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { contact: { $regex: search, $options: "i" } }
      ];
    }
    if (category) filter.category = category;
    if (status) filter.status = status;

    res.json(await Supplier.find(filter).sort({ status: 1, name: 1 }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    const products = await Product.find({ supplier: supplier._id }).select("name barcode quantity minimumStock categoryName");
    res.json({ supplier, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSupplier = async (req, res) => {
  try {
    res.status(201).json(await Supplier.create(req.body));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after", runValidators: true });
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    await Product.updateMany({ supplier: supplier._id }, { $unset: { supplier: 1 } });
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRestockRecommendation = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate("supplier");
    if (!product) return res.status(404).json({ message: "Product not found" });

    const supplier = product.supplier || await Supplier.findOne({
      category: product.categoryName || product.category,
      status: { $in: ["Priority", "Active"] }
    }).sort({ status: -1 });
    const orderMultiple = supplier?.orderMultiple || 1;
    const targetStock = Math.ceil(product.minimumStock * 1.8);
    const needed = Math.max(product.minimumStock - product.quantity, targetStock - product.quantity, 0);
    const suggestedQuantity = Math.max(orderMultiple, Math.ceil(needed / orderMultiple) * orderMultiple);

    res.json({ product, supplier, suggestedQuantity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier, getRestockRecommendation };
