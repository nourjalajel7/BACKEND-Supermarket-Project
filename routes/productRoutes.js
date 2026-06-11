const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getProductByBarcode,
  autocompleteProducts
} = require("../controllers/productController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { createProductValidator, updateProductValidator } = require("../validators/requestValidators");

const router = express.Router();

router.get("/", protect, getProducts);
router.get("/autocomplete", protect, autocompleteProducts);
router.get("/low-stock", protect, authorizeRoles("admin", "manager", "employee"), getLowStockProducts);
router.get("/barcode/:barcode", protect, getProductByBarcode);
router.get("/:id", protect, getProductById);
router.post("/", protect, authorizeRoles("admin", "manager"), createProductValidator, createProduct);
router.put("/:id", protect, authorizeRoles("admin", "manager"), updateProductValidator, updateProduct);
router.delete("/:id", protect, authorizeRoles("admin"), deleteProduct);

module.exports = router;
