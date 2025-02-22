import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/ChatPage/Sidebar";
import InputBox from "../components/ChatPage/InputBox";
import ChatHistory from "../components/ChatPage/ChatHistory";
import Header from "../components/ChatPage/Header";

const ChatPage = () => {
  const { chatId: urlChatId } = useParams();
  const navigate = useNavigate();
  const [chatId, setChatId] = useState(urlChatId || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const isNewChat = !urlChatId;
  const sidebarRef = useRef(null);
  const chatContainerRef = useRef(null); // Ref for chat container

  // Fetch chat history when URL chatId changes
  useEffect(() => {
    if (urlChatId) fetchChatHistory(urlChatId);
  }, [urlChatId]);

  useEffect(() => {
    if (chatId) fetchChatHistory(chatId);
  }, [chatId]);

  // Auto-open sidebar on mouse hover near left edge
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientX <= 20) setIsSidebarOpen(true);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  // Fetch chat history from backend
  const fetchChatHistory = async (chatId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/${chatId}`
      );
      setChatHistory(response.data.chatHistory || []);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  // Send message and update chat history
  const handleSendMessage = async (message) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat`,
        { chatId, message }
      );

      const { chatId: newChatId, response: botResponse, references } =
        response.data;

      if (!chatId) {
        setChatId(newChatId);
        navigate(`/chat/${newChatId}`);
      }

      setChatHistory((prevHistory) => [
        ...prevHistory,
        { query: message, response: botResponse, references: references || [] },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory((prevHistory) => [
        ...prevHistory,
        {
          query: message,
          response: "Error fetching response. Try again.",
          references: [],
        },
      ]);
    }
  };

  // Auto-scroll to the bottom when chat history updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#1b1c1d] text-white text-[16px]">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        sidebarRef={sidebarRef}
      />

      {/* Main Chat Section */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Chat Container */}
        <div
          ref={chatContainerRef}
          className="flex-1 flex flex-col px-4 max-h-[70vh] sm:px-10 overflow-y-auto pb-28 sm:pb-32"
        >
          {/* Show "What can I help with?" when no chat history */}
          {isNewChat && chatHistory.length === 0 ? (
            <div className="flex flex-col justify-center items-center flex-grow">
              <h1 className="text-center text-3xl sm:text-5xl font-semibold bg-gradient-to-r from-violet-400 via-blue-400 to-pink-400 text-transparent bg-clip-text">
                What can I help with?
              </h1>
            </div>
          ) : (
            <ChatHistory chatHistory={chatHistory} />
          )}
        </div>

        {/* Input Box */}
        <div
          className={`transition-all duration-500 ease-in-out delay-150 flex justify-center w-full absolute ${
            isNewChat ? "bottom-56" : "bottom-7"
          } left-0 p-4 `}
        >
          <InputBox onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
