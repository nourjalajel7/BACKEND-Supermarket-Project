const express = require("express");
const {
  register,
  bootstrapAdmin,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { loginRateLimit } = require("../middleware/rateLimitMiddleware");
const {
  registerValidator,
  bootstrapAdminValidator,
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} = require("../validators/requestValidators");

const router = express.Router();

router.post("/register", registerValidator, register);
router.post("/bootstrap-admin", bootstrapAdminValidator, bootstrapAdmin);
router.post("/login", loginRateLimit, loginValidator, login);
router.post("/forgot-password", forgotPasswordValidator, forgotPassword);
router.post("/reset-password", resetPasswordValidator, resetPassword);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePasswordValidator, changePassword);

module.exports = router;