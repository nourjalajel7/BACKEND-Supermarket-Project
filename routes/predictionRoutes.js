const express = require("express");
const {
  getInventoryPredictions,
  predictStock,
  recommendProducts,
  recommendCategories
} = require("../controllers/predictionController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/inventory", protect, authorizeRoles("admin", "manager"), getInventoryPredictions);
router.post("/predict-stock", protect, authorizeRoles("admin", "manager"), predictStock);
router.post("/recommend", protect, authorizeRoles("admin", "manager"), recommendProducts);
router.post("/recommend-categories", protect, authorizeRoles("admin", "manager"), recommendCategories);

module.exports = router;
