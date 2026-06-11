const express = require("express");
const { createUser, getUsers, getUserById, updateUser, deleteUser } = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin", "manager"));
router.post("/", createUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", authorizeRoles("admin"), deleteUser);

module.exports = router;
