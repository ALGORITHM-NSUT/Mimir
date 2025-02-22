import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import ChatHistory from "../components/ChatPage/ChatHistory";
import Header from "../components/ChatPage/Header";

const SharedChatPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedChat = async () => {
      try {
        if (!token) {
          setError("Invalid or missing token.");
          return;
        }
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/chat/shared?token=${token}`
        );

        setChatHistory(response.data.chatHistory || []);
      } catch (err) {
        console.error("Error fetching shared chat:", err);
        setError("Failed to load shared chat.");
      }
    };

    fetchSharedChat();
  }, [token]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#1b1c1d] text-white">
      <header className="w-full text-white py-4 px-6 flex items-center justify-center shadow-md bg-[#1b1c1d]">
        <span className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-blue-400 to-pink-400 text-transparent bg-clip-text text-center">
          Mimir
        </span>
      </header>


      <div className="w-full max-w-3xl p-4">
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : chatHistory.length > 0 ? (
          <ChatHistory chatHistory={chatHistory} />
        ) : (
          <p className="text-center text-gray-400">No messages in this chat.</p>
        )}
      </div>
    </div>
  );
};

export default SharedChatPage;
