const express = require("express");
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getRestockRecommendation
} = require("../controllers/supplierController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { supplierValidator } = require("../validators/requestValidators");

const router = express.Router();
router.use(protect, authorizeRoles("admin", "manager", "employee"));
router.get("/", getSuppliers);
router.get("/restock/:productId", getRestockRecommendation);
router.get("/:id", getSupplierById);
router.post("/", authorizeRoles("admin", "manager"), supplierValidator, createSupplier);
router.put("/:id", authorizeRoles("admin", "manager"), updateSupplier);
router.delete("/:id", authorizeRoles("admin", "manager"), deleteSupplier);

module.exports = router;
