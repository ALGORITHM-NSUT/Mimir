import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

// Stores chat history
const chatSessions = {};

// Stores user-to-chat mappings
const userChats = {};

// Stores shareable links
const shareableLinks = {};

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.get("/", (req, res) => {
  res.json({
    message: "Welcome Saumil",
  });
});

app.post("/api/chat", async (req, res) => {
  let { chatId, message, userId } = req.body;

  if (!message || !userId) {
    return res.status(400).json({ error: "Message and userId are required" });
  }

  if (!chatId) {
    // New chat creation
    chatId = `chat-${Date.now()}`;
    chatSessions[chatId] = { userId, title: "", messages: [] };

    if (!userChats[userId]) {
      userChats[userId] = [];
    }
    userChats[userId].push(chatId);
  } else {
    // Ensure chat exists
    if (!chatSessions[chatId]) {
      return res.status(404).json({ error: "Chat not found" });
    }
    // Ensure user owns the chat
    if (chatSessions[chatId].userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to this chat" });
    }
  }

  try {
    const systemPrompt = `
    You are Mimir, a RAG-based model that helps users query notices, circulars, rules, and regulations from Netaji Subhas University of Technology (NSUT), Delhi.
    Provide clear, accurate, and concise responses based on the retrieved data. The final response should be md file.
    Also you can answer coding related questions. 
    `;

    const augmented_message = `[ 
      { role: "system", content: "${systemPrompt}" }, 
      { role: "user", content: "${message}" } 
    ]`;

    const result = await model.generateContent(augmented_message);
    const responseText = result.response.text();

    const responseObject = {
      query: message,
      response: responseText,
      references: [
        { title: "Reference 1", url: "https://example.com/ref1" },
        { title: "Reference 2", url: "https://example.com/ref2" },
      ],
    };

    if (chatSessions[chatId].messages.length === 0) {
      chatSessions[chatId].title =
        message.length > 20 ? message.substring(0, 20) + "..." : message;
    }

    chatSessions[chatId].messages.push(responseObject);

    res.json({
      chatId,
      response: responseText,
      references: responseObject.references,
    });
  } catch (error) {
    console.error("Error generating AI response:", error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

app.get("/api/chats", async (req, res) => {
  const { userId } = req.query;

  if (!userId || !userChats[userId]) {
    return res.json({ chats: [] });
  }

  const chatList = userChats[userId].map((chatId) => ({
    chatId,
    title: chatSessions[chatId]?.title || "Untitled Chat",
  }));

  res.json({ chats: chatList });
});

app.post("/api/chat/share", async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !chatSessions[chatId]) {
    return res.status(404).json({ error: "Chat not found" });
  }

  if (chatSessions[chatId].userId !== userId) {
    return res.status(403).json({ error: "Unauthorized to share this chat" });
  }

  const userHex = Buffer.from(userId).toString("hex");
  const chatHex = Buffer.from(chatId).toString("hex");

  const shareToken = userHex + chatHex;
  shareableLinks[shareToken] = { chatId };

  const shareableLink = `${process.env.FRONTEND_URL}/chat/shared?token=${shareToken}`;

  res.json({ message: "Chat is now shareable", shareableLink });
});

app.get("/api/chat/shared", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      console.warn("Missing token in request.");
      return res.status(400).json({ error: "Token is required." });
    }

    if (!shareableLinks[token]) {
      console.warn(`Invalid or expired token: ${token}`);
      return res.status(403).json({ error: "Invalid or expired share link." });
    }

    const { chatId } = shareableLinks[token];

    if (!chatSessions[chatId]) {
      console.warn(`Chat not found for token: ${token}, chatId: ${chatId}`);
      return res.status(404).json({ error: "Chat not found." });
    }

    res.json({
      chatId,
      chatHistory: chatSessions[chatId].messages,
    });
  } catch (error) {
    console.error("Error fetching shared chat:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

app.get("/api/chat/:chatId", async (req, res) => {
  const { chatId } = req.params;
  const { userId } = req.query;

  if (!chatSessions[chatId]) {
    return res.status(404).json({ error: "Chat not found" });
  }

  if (chatSessions[chatId].userId !== userId) {
    return res.status(403).json({ error: "Unauthorized access to this chat" });
  }

  res.json({ chatId, chatHistory: chatSessions[chatId].messages });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
