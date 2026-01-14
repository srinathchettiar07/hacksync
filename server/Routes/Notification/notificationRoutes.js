import express from "express";
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationCount
} from "../../controllers/notificationController.js";

const notificationRoute = express.Router();

// Create a notification
notificationRoute.post("/", createNotification);

// Get notifications for a user
notificationRoute.get("/user/:userId", getUserNotifications);

// Mark notification as read
notificationRoute.patch("/:notificationId/read", markNotificationAsRead);

// Mark all notifications as read for a user
notificationRoute.patch("/mark-all-read", markAllNotificationsAsRead);

// Delete notification
notificationRoute.delete("/:notificationId", deleteNotification);

// Get notification count for a user
notificationRoute.get("/count/:userId", getNotificationCount);

export default notificationRoute;