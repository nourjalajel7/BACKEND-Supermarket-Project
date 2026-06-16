const Product = require("../models/productModel");
const Supplier = require("../models/supplierModel");
const Category = require("../models/categoryModel");
const { parseCsv, productsToCsv } = require("../services/productCsvService");

const importProductsCsv = async (req, res) => {
  try {
    const rows = parseCsv(String(req.body.csv || ""));
    if (!rows.length) return res.status(400).json({ message: "CSV contains no product rows" });

    const results = { created: 0, updated: 0, errors: [] };
    for (const [index, row] of rows.entries()) {
      try {
        const name = row.product_name?.trim();
        const barcode = row.barcode?.trim();
        if (!name || !barcode) throw new Error("product_name and barcode are required");

        const categoryName = row.category?.trim() || "General";
        const category = await Category.findOneAndUpdate(
          { name: categoryName },
          { $setOnInsert: { name: categoryName } },
          { returnDocument: "after", upsert: true }
        );

        let supplier;
        if (row.supplier_id) {
          supplier = row.supplier_id.match(/^[0-9a-fA-F]{24}$/)
            ? await Supplier.findById(row.supplier_id)
            : await Supplier.findOne({ name: row.supplier_id.trim() });
        }

        const payload = {
          name,
          barcode,
          category: categoryName,
          categoryName,
          categoryRef: category._id,
          imageUrl: row.image_url?.trim(),
          price: Number(row.price_jd),
          quantity: Number(row.stock_quantity),
          minimumStock: Number(row.minimum_stock) || 0,
          healthTags: String(row.health_tags || "").split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean),
          supplier: supplier?._id
        };

        if (![payload.price, payload.quantity, payload.minimumStock].every(Number.isFinite)) {
          throw new Error("price_jd, stock_quantity and minimum_stock must be numbers");
        }

        const existing = await Product.findOne({ barcode });
        if (existing) {
          await Product.updateOne({ _id: existing._id }, payload, { runValidators: true });
          results.updated += 1;
        } else {
          await Product.create(payload);
          results.created += 1;
        }
      } catch (error) {
        results.errors.push({ row: index + 2, message: error.message });
      }
    }

    res.status(results.errors.length ? 207 : 200).json(results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const exportProductsCsv = async (req, res) => {
  try {
    const products = await Product.find().populate("supplier", "name");
    res.type("text/csv").attachment("products.csv").send(productsToCsv(products));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { importProductsCsv, exportProductsCsv };
