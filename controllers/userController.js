const User = require("../models/userModel");

const assignableRoles = ["admin", "manager", "employee", "user"];
const managerAssignableRoles = ["employee", "user"];

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
  createdAt: user.createdAt
});

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const getAssignableRole = (requestedRole, actorRole) => {
  const fallbackRole = "user";

  if (!requestedRole) {
    return fallbackRole;
  }

  if (!assignableRoles.includes(requestedRole)) {
    const error = new Error("Invalid user role");
    error.statusCode = 400;
    throw error;
  }

  if (actorRole !== "admin" && !managerAssignableRoles.includes(requestedRole)) {
    const error = new Error("Managers can only assign employee or user roles");
    error.statusCode = 403;
    throw error;
  }

  return requestedRole;
};

const createUser = async (req, res) => {
  try {
    const { name, password, phone, address } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
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
      role: getAssignableRole(req.body.role, req.user.role),
      isEmailVerified: true,
      emailVerifiedAt: new Date()
    });

    res.status(201).json(sanitizeUser(user));
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { role: { $in: managerAssignableRoles } };
    const users = await User.find(filter).select("-password -resetOtp -resetOtpExpires").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -resetOtp -resetOtpExpires");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.role !== "admin" && !managerAssignableRoles.includes(user.role)) {
      return res.status(403).json({ message: "Managers can only access employee or user accounts" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.role !== "admin" && !managerAssignableRoles.includes(user.role)) {
      return res.status(403).json({ message: "Managers can only update employee or user accounts" });
    }

    ["name", "phone", "address"].forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    if (req.body.email !== undefined) {
      const email = normalizeEmail(req.body.email);
      const userExists = await User.findOne({ email, _id: { $ne: user._id } });

      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }

      user.email = email;
    }

    if (req.body.role !== undefined) {
      user.role = getAssignableRole(req.body.role, req.user.role);
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();
    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
