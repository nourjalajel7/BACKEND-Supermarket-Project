const express = require("express");
const { createCategory, getCategories, updateCategory, deleteCategory } = require("../controllers/categoryController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { createCategoryValidator } = require("../validators/requestValidators");

const router = express.Router();

router.get("/", protect, getCategories);
router.post("/", protect, authorizeRoles("admin", "manager"), createCategoryValidator, createCategory);
router.put("/:id", protect, authorizeRoles("admin", "manager"), updateCategory);
router.delete("/:id", protect, authorizeRoles("admin"), deleteCategory);

module.exports = router;
