const express = require("express");
const { getPreferences, updatePreferences } = require("../controllers/preferenceController");
const { protect } = require("../middleware/authMiddleware");
const { preferenceValidator } = require("../validators/requestValidators");

const router = express.Router();
router.use(protect);
router.get("/", getPreferences);
router.put("/", preferenceValidator, updatePreferences);

module.exports = router;
