const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { isEmailConfigured, sendOtpEmail } = require("../services/emailService");

const createToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address,
});

const normalizeEmail = (email) => email.trim().toLowerCase();

// Register a new user
const register = async (req, res) => {
  try {
    const { name, password, phone, address } = req.body;
    const email = req.body.email ? normalizeEmail(req.body.email) : "";

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const adminsCount = await User.countDocuments({ role: "admin" });
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: adminsCount === 0 ? "admin" : "user",
    });
    const token = createToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Bootstrap admin user
const bootstrapAdmin = async (req, res) => {
  try {
    const { name, password, bootstrapKey } = req.body;
    const email = req.body.email ? normalizeEmail(req.body.email) : "";
    const expectedKey = process.env.BOOTSTRAP_ADMIN_KEY;

    if (!expectedKey || bootstrapKey !== expectedKey) {
      return res.status(403).json({ message: "Invalid bootstrap key" });
    }

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    let user = await User.findOne({ email });

    if (user) {
      user.name = name;
      user.password = password;
      user.role = "admin";
      await user.save();
    } else {
      user = await User.create({ name, email, password, role: "admin" });
    }

    const token = createToken(user);

    res.status(201).json({
      message: "Admin is ready",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email ? normalizeEmail(req.body.email) : "";

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = createToken(user);

    res.json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  res.json(sanitizeUser(req.user));
};
// Update user profile
const updateProfile = async (req, res) => {
  try {
    const allowed = ["name", "phone", "address"];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.user[field] = req.body[field];
      }
    });

    await req.user.save();
    res.json({ message: "Profile updated", user: sanitizeUser(req.user) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Change user password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    const user = await User.findById(req.user._id);

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Forgot password - generate OTP and send email
const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email ? normalizeEmail(req.body.email) : "";
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const emailSent = isEmailConfigured();

    if (emailSent) {
      await sendOtpEmail({ to: user.email, otp });
    }

    const response = {
      message: emailSent
        ? "OTP sent successfully"
        : "OTP generated but email service is not configured",
      emailSent,
    };

    if (process.env.OTP_EXPOSE_IN_RESPONSE === "true") {
      response.otp = otp;
    }

    res.json(response);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
// Reset password using OTP
const resetPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    const email = req.body.email ? normalizeEmail(req.body.email) : "";
    const user = await User.findOne({
      email,
      resetOtp: otp,
      resetOtpExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  register,
  bootstrapAdmin,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
