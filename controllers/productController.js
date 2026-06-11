const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Notification = require("../models/notificationModel");

const resolveCategory = async ({ category, categoryName }) => {
  if (category) {
    const existingCategory = category.match(/^[0-9a-fA-F]{24}$/)
      ? await Category.findById(category)
      : await Category.findOneAndUpdate(
        { name: category },
        { $setOnInsert: { name: category } },
        { returnDocument: "after", upsert: true }
      );

    if (!existingCategory) {
      throw new Error("Category not found");
    }

    return existingCategory;
  }

  const name = categoryName || "General";
  return Category.findOneAndUpdate(
    { name },
    { $setOnInsert: { name } },
    { returnDocument: "after", upsert: true }
  );
};

const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, lowStock, barcode, sort = "-createdAt", page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { categoryName: { $regex: search, $options: "i" } }
      ];
    }

    if (category) {
      filter.$or = filter.$or || [];
      filter.$or.push({ categoryName: { $regex: category, $options: "i" } });

      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.$or.push({ categoryRef: category });
      }
    }

    if (barcode) {
      filter.barcode = barcode;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (lowStock === "true") {
      filter.$expr = { $lte: ["$quantity", "$minimumStock"] };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(filter).populate("categoryRef").sort(sort).skip(skip).limit(Number(limit));
    const total = await Product.countDocuments(filter);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) || 1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("categoryRef");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const category = await resolveCategory(req.body);
    const product = await Product.create({ ...req.body, category: category.name, categoryRef: category._id, categoryName: category.name });

    if (product.quantity <= product.minimumStock) {
      await Notification.create({
        title: "Low stock product",
        message: `${product.name} reached low stock level`,
        type: "low_stock",
        product: product._id
      });
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (req.body.category || req.body.categoryName) {
      const category = await resolveCategory(req.body);
      payload.category = category.name;
      payload.categoryRef = category._id;
      payload.categoryName = category.name;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, payload, { returnDocument: "after", runValidators: true });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.quantity <= product.minimumStock) {
      await Notification.create({
        title: "Low stock product",
        message: `${product.name} reached low stock level`,
        type: "low_stock",
        product: product._id
      });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ $expr: { $lte: ["$quantity", "$minimumStock"] } }).populate("categoryRef");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductByBarcode = async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode }).populate("categoryRef");

    if (!product) {
      return res.status(404).json({ message: "Product not found for this barcode" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const autocompleteProducts = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { barcode: { $regex: q, $options: "i" } }
      ]
    })
      .select("name barcode price imageUrl quantity")
      .limit(10);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getProductByBarcode,
  autocompleteProducts
};
