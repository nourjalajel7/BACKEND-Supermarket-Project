const express = require("express");
const { importProductsCsv, exportProductsCsv } = require("../controllers/productCsvController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect, authorizeRoles("admin", "manager"));
router.get("/", exportProductsCsv);
router.post("/", importProductsCsv);

module.exports = router;
