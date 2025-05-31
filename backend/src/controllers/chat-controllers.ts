import { Request, Response, NextFunction } from "express";

interface CustomRequest extends Request {
	userId?: string;
}
import User from "../models/user-model.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { randomUUID } from "crypto";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama3-8b-8192";
const HEADERS = {
  Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
  "Content-Type": "application/json",
};

const generateChatTitle = async (query: string, response: string) => {
  const prompt = `You are an AI assistant that generates short and meaningful chat titles. 
Given a user's query and an assistant's response, return a concise, 4–8 word title summarizing the topic. 
Do not include quotes, punctuation, or emojis—just the title.

User's Query: ${query}
Assistant's Response: ${response}

Title:`;

  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: "You generate chat titles." },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 20,
  };

  try {
    const res = await axios.post(GROQ_API_URL, body, { headers: HEADERS });
    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("Error generating title:", err.message);
    return null;
  }
};

const generateGptResponse = async (history: any[], query: string) => {
  const conversationText = history
    .map((msg) => `${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}: ${msg.content}`)
    .join("\n");

  const prompt = `You are a helpful legal assistant. Use the user's past conversation to respond thoughtfully. 
Do not mention you have access to prior history, but integrate it naturally.

Conversation history:
${conversationText}

User's Latest Query:
${query}

Your response:`;

  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: "You are a compassionate legal assistant." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 800,
  };

  try {
    const res = await axios.post(GROQ_API_URL, body, { headers: HEADERS });
    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("Groq API Error:", err.message);
    return `[Error from Groq: ${err.message}]`;
  }
};

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

    let chat = chatId ? user.chats.find((c) => c.id === chatId) : null;
    if (chatId && !chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat) {
      chat = {
        id: uuidv4(),
        title: "New Chat",
        messages: [],
      };
      user.chats.push(chat);
    }

    const history = Array.isArray(chat.messages) ? chat.messages : ([] as typeof chat.messages);
    const assistantReply = await generateGptResponse(history, message);

    // Add messages to chat
    chat.messages.push({ role: "user", content: message });
    chat.messages.push({ role: "assistant", content: assistantReply });

    // If title is still "New Chat", try to auto-generate a better title
    if (chat.title.toLowerCase() === "new chat") {
      const title = await generateChatTitle(message, assistantReply);
      if (title) {
        chat.title = title;
      }
    }

    await user.save();

    return res.status(200).json({ chatId: chat.id, messages: chat.messages });
  } catch (error: any) {
    console.error("Controller Error:", error.message);
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

