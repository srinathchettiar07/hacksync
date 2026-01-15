import express from "express";
import { Message } from "../../models/models.js";

const messageRoute = express.Router();

// Get messages
messageRoute.get("/messages", async (req, res) => {
  try {
    const { limit = 50, room = "public-room" } = req.query;
    const userId = req.user;

    const messages = await Message.find({ room })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("sender", "displayName profilePicture")
      .lean();

    // Reverse to show oldest first
    const reversedMessages = messages.reverse().map((msg) => ({
      _id: msg._id,
      content: msg.content,
      sender: msg.sender?._id || msg.sender,
      senderName: msg.senderName || msg.sender?.displayName || "Unknown",
      room: msg.room,
      createdAt: msg.createdAt,
      messageType: msg.messageType || "text",
    }));

    res.json({
      success: true,
      messages: reversedMessages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
});

export default messageRoute;