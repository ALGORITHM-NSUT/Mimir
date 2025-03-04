import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/ChatPage/Sidebar";
import InputBox from "../components/ChatPage/InputBox";
import ChatHistory from "../components/ChatPage/ChatHistory";
import Header from "../components/ChatPage/Header";
import { UserContext } from "../Context/UserContext";
import Alert from "@mui/material/Alert";
import { motion, AnimatePresence } from "framer-motion";

const ChatPage = () => {
  const { chatId: urlChatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [chatId, setChatId] = useState(urlChatId || null);
  const [messageId, setMessageId] = useState();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const sidebarRef = useRef(null);
  const chatContainerRef = useRef(null);
  const { user } = useContext(UserContext);
  const userId = user.userId;
  const [alert, setAlert] = useState(null);
  const [isNewChat, setIsNewChat] = useState(location.pathname === "/new");
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    if (alert) {
      const timeout = setTimeout(() => {
        setAlert(null);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [alert]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientX <= 20) setIsSidebarOpen(true);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

  useEffect(() => {
    setChatId(urlChatId);
    if (urlChatId) {
      const storedChat = sessionStorage.getItem("chatHistory");
      if (storedChat) {
        const parsedChat = JSON.parse(storedChat);
        if (parsedChat.chatId === urlChatId) {
          setChatHistory(parsedChat.history);
          setMessageId(parsedChat.messageId);
          sessionStorage.removeItem("chatHistory");

          return;
        }
      }
      fetchChatHistory(urlChatId);
    }
  }, [urlChatId]);

  const fetchChatHistory = async (chatId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/${chatId}`,
        { userId, messageId }
      );

      const updatedHistory = response.data.chatHistory;
      if (updatedHistory.length !== 0) {
        setChatHistory(updatedHistory);
      }
    } catch (error) {
      navigate("/new");
    }
  };

  const handleSendMessage = async (message) => {
    const updatedHistory = [
      ...chatHistory,
      { query: message, response: "Processing...", references: [], status: "Processing" },
    ];

    setChatHistory(updatedHistory);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat`,
        { chatId, message, userId, chatHistory }
      );

      const { chatId: newChatId, messageId } = response.data;

      setMessageId(response.data.messageId);

      if (isNewChat) {
        sessionStorage.setItem("chatHistory", JSON.stringify({ chatId: newChatId, messageId, history: updatedHistory }));
        navigate(`/chat/${newChatId}`);
      }

      setIsNewChat(false);
      setChatId(newChatId);
      pollForUpdatedResponse(userId, messageId);
    } catch (error) {
      setChatHistory((prevHistory) => {
        const updatedHistory = [
          ...prevHistory,
          {
            query: message,
            response: "Error fetching response. Try again.",
            references: [],
            status: "failed",
          },
        ];

        return updatedHistory;
      });
    }
  };

  const pollForUpdatedResponse = (userId, messageId) => {
    const interval = setInterval(async () => {
      try {
        console.log("making api call");
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/chat/response/${userId}`,
          { messageId }
        );

        console.log("Polling Response:", response.data); // Debugging

        const { query: message, response: botResponse, references } = response.data;

        if (botResponse && botResponse !== "Processing") {
          setChatHistory((prevHistory) =>
            prevHistory.map((item) =>
              item.query === message
                ? { ...item, response: botResponse, references: references || [], status: "resolved" }
                : item
            )
          );

          setIsNewChat(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error polling for response:", error);
      }
    }, 4000);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        setShowScrollButton(scrollTop + clientHeight < scrollHeight - 100);
      }
    };

    if (chatContainerRef.current) {
      chatContainerRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#1b1c1d] text-white text-[16px] flex flex-col">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        sidebarRef={sidebarRef}
        setAlert={setAlert}
      />

      <div className="flex flex-col flex-grow items-center">
        {/* Header Section */}
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} setAlert={setAlert} />

        {/* Chat History Section */}
        <div
          ref={chatContainerRef}
          className="flex-grow flex sm:max-h-[70vh] max-h-[65vh] flex-col px-4 sm:px-10 overflow-y-auto pb-24 sm:pb-28 w-full sm:w-[70%] "
        >
          {isNewChat === true ? (
            <div className="flex flex-col justify-center items-center mb-20 flex-grow">
              <h1 className="text-center text-5xl sm:text-5xl lg:text-5xl font-semibold bg-gradient-to-r from-violet-400 via-blue-400 to-pink-400 text-transparent bg-clip-text">
                What can I help with?
              </h1>
            </div>
          ) : (
            <>
              <ChatHistory chatHistory={chatHistory} />
            </>
          )}
        </div>
      </div>

      <motion.div
        className={`fixed bottom-0 left-0 right-0 bg-[#1b1c1d] ${
          isNewChat ? "bottom-48" : "bottom-0"
        } `}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <div className={`mx-auto px-4 py-4 flex w-full justify-center`}> {/* Centered and added padding */}
          <InputBox onSendMessage={handleSendMessage} setAlert={setAlert} />
        </div>
      </motion.div>

      {alert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-96 z-50">
          <Alert severity={alert.type}>{alert.text}</Alert>
        </div>
      )}

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' })}
            className="fixed bottom-32 right-8 bg-gray-800 text-white rounded-full p-3 shadow-lg cursor-pointer z-50 hover:shadow-xl transition-shadow duration-300"
            style={{
              boxShadow: '0 0 20px rgba(123, 97, 255, 0.3)'
            }}
          >
            <motion.div
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;