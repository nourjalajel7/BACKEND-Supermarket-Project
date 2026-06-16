const Reward = require("../models/rewardModel");
const LoyaltyTransaction = require("../models/loyaltyTransactionModel");

const getRewards = async (req, res) => {
  try {
    const filter = ["admin", "manager"].includes(req.user.role) ? {} : { isActive: true };
    res.json(await Reward.find(filter).sort({ points: 1 }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReward = async (req, res) => {
  try {
    res.status(201).json(await Reward.create(req.body));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after", runValidators: true });
    if (!reward) return res.status(404).json({ message: "Reward not found" });
    res.json(reward);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (!reward) return res.status(404).json({ message: "Reward not found" });
    res.json({ message: "Reward deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLoyaltyAccount = async (req, res) => {
  try {
    const history = await LoyaltyTransaction.find({ user: req.user._id }).populate("reward", "title").sort({ createdAt: -1 }).limit(50);
    res.json({
      points: req.user.loyaltyPoints,
      membershipLevel: req.user.membershipLevel,
      history
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRewards, createReward, updateReward, deleteReward, getLoyaltyAccount };
