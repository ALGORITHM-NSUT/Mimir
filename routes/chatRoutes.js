import express from 'express';
import fetch from 'node-fetch';
import Chat from '../models/Chat.js';

const router = express.Router();

// Middleware for user authentication (if using JWT)
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).send('Unauthorized');
  }
  // Decode JWT and add user to request
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;  // Assuming JWT contains user data
    next();
  } catch (e) {
    res.status(401).send('Invalid token');
  }
};

router.post('/', authenticate, async (req, res) => {
  const { prompt } = req.body;
  const userId = req.user.id;  // Get user ID from decoded JWT

  const userMessage = {
    role: 'user',
    content: prompt,
  };

  try {
    // Make API request to Gemini or OpenAI (example using Gemini)
    const response = await fetch('https://api.gemini.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-xyz-model',  // Replace with actual model name
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await response.json();

    const assistantMessage = {
      role: 'assistant',
      content: data.choices[0].message.content, // Adjust based on Gemini's response format
    };

    // Save conversation to MongoDB
    const newChat = new Chat({
      userId,
      messages: [userMessage, assistantMessage],
    });
    await newChat.save();

    res.send(assistantMessage);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
