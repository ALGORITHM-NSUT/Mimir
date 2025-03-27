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
    <div className="relative min-h-screen w-full bg-[#1b1c1d] text-white text-[16px] flex flex-col">
      <header className="w-full text-white py-4 px-6 flex items-center justify-center shadow-md bg-transparent backdrop-blur-3xl sticky z-10 top-0">
        <span className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-blue-400 to-pink-400 text-transparent bg-clip-text text-center">
          Mimir
        </span>
      </header>


     
        <div className="flex justify-center">

          <ChatHistory chatHistory={chatHistory} />

        </div>
      


    </div>
  );
};

export default SharedChatPage;
