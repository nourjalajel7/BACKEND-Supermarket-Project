const express = require("express");
const { createUser, getUsers, getUserById, updateUser, deleteUser } = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { createUserValidator, updateUserValidator } = require("../validators/requestValidators");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin", "manager"));
router.post("/", createUserValidator, createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUserValidator, updateUser);
router.delete("/:id", authorizeRoles("admin"), deleteUser);

module.exports = router;
