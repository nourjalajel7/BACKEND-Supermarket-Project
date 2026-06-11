const express = require("express");
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} = require("../controllers/notificationController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin", "manager", "employee"));
router.get("/", getNotifications);
router.put("/read-all", markAllNotificationsRead);
router.put("/:id/read", markNotificationRead);
router.delete("/:id", authorizeRoles("admin", "manager"), deleteNotification);

module.exports = router;
