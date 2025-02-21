import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();


// In-memory storage for chat history (replace with DB later)
const chatSessions = {}; 

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); // Replace with your actual API key
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

app.post("/api/chat", async (req, res) => {
  let { chatId, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // If no chatId, create a new chat session
  if (!chatId) {
    chatId = `chat-${Date.now()}`;
    chatSessions[chatId] = { title: "", messages: [] }; 
  } else if (!chatSessions[chatId]) {
    chatSessions[chatId] = { title: "", messages: [] }; 
  }

  try {
    const systemPrompt = `
    You are Mimir, a RAG-based model that helps users query notices, circulars, rules, and regulations from Netaji Subhas University of Technology (NSUT), Delhi.
    Provide clear, accurate, and concise responses based on the retrieved data. The final response should be just natural language text.
    Also you can answer coding related questions.
    `;

    const augmented_message = `
      content: [
      { role: "system", content: ${systemPrompt} },
      { role: "user", content: ${message} },
      ]
    `;

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
      chatSessions[chatId].title = message.length > 20 ? message.substring(0, 20) + "..." : message;
    }

    chatSessions[chatId].messages.push(responseObject);

    res.json({ chatId, response: responseText, references: responseObject.references });
  } catch (error) {
    console.error("Error generating AI response:", error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});



// Fetch a specific chat history
app.get("/api/chat/:chatId", async (req, res) => {
  const { chatId } = req.params;

  if (!chatSessions[chatId]) {
    return res.status(404).json({ error: "Chat not found" });
  }

  res.json({
    chatId,
    chatHistory: chatSessions[chatId].messages,
  });
});

// Fetch all previous chat sessions
app.get("/api/chats", async (req, res) => {
  const chatList = Object.keys(chatSessions).map((chatId) => ({
    chatId,
    title: chatSessions[chatId].title || "Untitled Chat",
  }));

  res.json({ chats: chatList });
});

// Start Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
