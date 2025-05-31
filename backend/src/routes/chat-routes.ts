import express from "express";
import { verifyToken } from "../utils/token-manager.js";
import {
  chatCompletionValidator,
  validate
} from "../utils/validators.js";
import {
  deleteAllChats,
  generateChatCompletion,
  getAllChats,
  deleteChatById,
  deleteMessageById,
  getChatById,
  createNewChat
} from "../controllers/chat-controllers.js";

const chatRoutes = express.Router();

// Test route
chatRoutes.get("/", (req, res) => {
  console.log("hi");
  res.send("hello from chatRoutes");
});

// === Protected Routes ===

// Create or update chat session
chatRoutes.post(
  "/add-message/:chatId",
  validate(chatCompletionValidator),
  verifyToken,
  generateChatCompletion
);

chatRoutes.post(
  "/new-chat",
  verifyToken,
  createNewChat
);

// Get all chats (summary list)
chatRoutes.get(
  "/all-chats",
  verifyToken,
  getAllChats
);

chatRoutes.get(
  "/get-chat/:chatId",
  verifyToken,
  getChatById
);

// Delete all chat sessions
chatRoutes.delete(
  "/delete-all-chats",
  verifyToken,
  deleteAllChats
);

// Delete one chat session by ID
chatRoutes.delete(
  "/delete/chat/:chatId",
  verifyToken,
  deleteChatById
);

// Delete one message from a chat
chatRoutes.delete(
  "/chat/:chatId/messages/:messageId",
  verifyToken,
  deleteMessageById
);

export default chatRoutes;
