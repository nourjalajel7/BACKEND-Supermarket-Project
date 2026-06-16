const express = require("express");
const {
  getRewards,
  createReward,
  updateReward,
  deleteReward,
  getLoyaltyAccount
} = require("../controllers/rewardController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { rewardValidator } = require("../validators/requestValidators");

const router = express.Router();
router.use(protect);
router.get("/", getRewards);
router.get("/account", getLoyaltyAccount);
router.post("/", authorizeRoles("admin", "manager"), rewardValidator, createReward);
router.put("/:id", authorizeRoles("admin", "manager"), updateReward);
router.delete("/:id", authorizeRoles("admin"), deleteReward);

module.exports = router;
