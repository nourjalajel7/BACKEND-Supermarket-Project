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
  loyaltyPoints: user.loyaltyPoints,
  membershipLevel: user.membershipLevel,
  preferences: user.preferences,
  isEmailVerified: user.isEmailVerified,
});

const normalizeEmail = (email) => email.trim().toLowerCase();
const createOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const setEmailVerificationOtp = async (user) => {
  const otp = createOtp();
  user.emailVerificationOtp = otp;
  user.emailVerificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  return otp;
};

const sendEmailVerificationOtp = async (user) => {
  const otp = await setEmailVerificationOtp(user);
  const emailSent = isEmailConfigured();

  if (emailSent) {
    await sendOtpEmail({
      to: user.email,
      otp,
      purpose: "email-verification",
    });
  }

  const response = {
    message: emailSent
      ? "Email verification OTP sent successfully"
      : "Email verification OTP generated but email service is not configured",
    emailSent,
    requiresEmailVerification: true,
  };

  if (process.env.OTP_EXPOSE_IN_RESPONSE === "true") {
    response.otp = otp;
  }

  return response;
};

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

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: "user",
    });
    const otpResponse = await sendEmailVerificationOtp(user);

    res.status(201).json({
      ...otpResponse,
      message: "User registered successfully. Please verify your email to continue.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Bootstrap admin user
const bootstrapAdmin = async (req, res) => {
  try {
    const { name, password, phone, address, bootstrapKey } = req.body;
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
      user.phone = phone;
      user.address = address;
      user.role = "admin";
      user.isEmailVerified = true;
      user.emailVerifiedAt = new Date();
      user.emailVerificationOtp = undefined;
      user.emailVerificationOtpExpires = undefined;
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        password,
        phone,
        address,
        role: "admin",
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      });
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

    if (!user.isEmailVerified) {
      const otpResponse = await sendEmailVerificationOtp(user);
      return res.status(403).json({
        ...otpResponse,
        message: "Email verification is required before login",
        user: sanitizeUser(user),
      });
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

// Request email verification OTP
const requestEmailVerification = async (req, res) => {
  try {
    const email = req.body.email ? normalizeEmail(req.body.email) : "";
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.json({
        message: "Email is already verified",
        requiresEmailVerification: false,
        user: sanitizeUser(user),
      });
    }

    const otpResponse = await sendEmailVerificationOtp(user);

    res.json({
      ...otpResponse,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// Verify email using OTP and issue token
const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const email = req.body.email ? normalizeEmail(req.body.email) : "";
    const user = await User.findOne({
      email,
      emailVerificationOtp: otp,
      emailVerificationOtpExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpires = undefined;
    await user.save();

    const token = createToken(user);

    res.json({
      message: "Email verified successfully",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
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

    const otp = createOtp();
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
  requestEmailVerification,
  verifyEmail,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
