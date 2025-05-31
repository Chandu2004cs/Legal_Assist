import { Request, Response, NextFunction } from "express";

interface CustomRequest extends Request {
	userId?: string;
}
import User from "../models/user-model.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { randomUUID } from "crypto";

// Generate or update a chat session
export const generateChatCompletion = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { message } = req.body;
		const chatId = req.params.chatId;
		const user = await User.findById(res.locals.jwtData.id);

		if (!user) {
			return res.status(401).json("User not registered / token malfunctioned");
		}

		// === Call external legal assistant ===
		const response = await axios.post(process.env.FLASK_URL, {
			userId: user._id.toString(),
			chatId: chatId,
			query: message,
		});
		const assistantReply = response.data.response;

		let chat;

		// === If chatId provided, append to existing chat ===
		if (chatId) {
			chat = user.chats.find(c => c.id === chatId);
			if (!chat) return res.status(404).json({ message: "Chat not found" });
		} else {
			// === Otherwise, create new chat ===
			chat = {
				id: uuidv4(),
				title: "New Chat",
				messages: [],
			};
			user.chats.push(chat);
		}

		// === Append user and assistant messages ===
		chat.messages.push({ role: "user", content: message });
		chat.messages.push({ role: "assistant", content: assistantReply });

		await user.save();

		return res.status(200).json({ chatId: chat.id, messages: chat.messages });
	} catch (error: any) {
		console.error("Error:", error);
		return res.status(500).json({ message: error.message });
	}
};


export const createNewChat = async (req: Request, res: Response) => {
	try {
	  const user = await User.findById(res.locals.jwtData.id);
	  if (!user) return res.status(404).json({ message: "User not found" });
  
	  const newChat = {
		id: randomUUID(),
		title: "New Chat",
		messages: [],
	  };
  
	  user.chats.push(newChat as any); // If needed, cast to the correct subdocument type
	  await user.save();
  
	  return res.status(201).json({ message: "New chat created", chat: newChat });
	} catch (error) {
	  console.error("Error creating new chat:", error);
	  return res.status(500).json({ message: "Internal Server Error" });
	}
  };
  

// Fetch all chat sessions (titles + ids)
export const getAllChats = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = await User.findById(res.locals.jwtData.id);
		if (!user) return res.status(401).json({ message: "User not found" });
		const chatSummaries = user.chats.map(chat => ({
			id: chat.id,
			title: chat.title,
			lastMessage: chat.messages.at(-1)?.content || "",
		}));
		return res.status(200).json({ chats: chatSummaries });
	} catch (err: any) {
		console.log(err);
		return res.status(500).json({ message: err.message });
	}
};

// Fetch messages for a specific chat session
export const getChatById = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		console.log(req.params.chatId);
		const user = await User.findById(res.locals.jwtData.id);
		if (!user) return res.status(401).json({ message: "User not found" });

		const chat = user.chats.find(c => c.id === req.params.chatId);
		if (!chat) return res.status(404).json({ message: "Chat not found" });

		return res.status(200).json({ chatId: chat.id, messages: chat.messages });
	} catch (err: any) {
		console.log(err);
		return res.status(500).json({ message: err.message });
	}
};

// Delete all chat sessions
export const deleteAllChats = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = await User.findById(res.locals.jwtData.id);
		if (!user) return res.status(401).json({ message: "User not found" });

		user.chats.splice(0, user.chats.length);
		await user.save();

		return res.status(200).json({ message: "All chats deleted" });
	} catch (err: any) {
		console.log(err);
		return res.status(500).json({ message: err.message });
	}
};


export const deleteChatById = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = await User.findById(res.locals.jwtData.id);
		if (!user) return res.status(401).json({ message: "User not found" });

		const chatId = req.params.chatId;
		user.chats.pull({ id: chatId });

		await user.save();
		return res.status(200).json({ message: "Chat deleted", chatId });
	} catch (err: any) {
		console.error(err);
		return res.status(500).json({ message: err.message });
	}
};


export const deleteMessageById = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const user = await User.findById(res.locals.jwtData.id);
		if (!user) return res.status(401).json({ message: "User not found" });

		const { chatId, messageId } = req.params;

		const chat = user.chats.find(chat => chat.id === chatId);
		if (!chat) return res.status(404).json({ message: "Chat not found" });

		// Proper Mongoose mutation
		chat.messages.pull({ id: messageId });

		await user.save();
		return res.status(200).json({ message: "Message deleted", messageId });
	} catch (err: any) {
		console.error(err);
		return res.status(500).json({ message: err.message });
	}
};

