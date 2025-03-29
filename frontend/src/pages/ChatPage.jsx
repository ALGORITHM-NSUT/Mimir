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
import ScrollCue from "../components/ChatPage/ScrollCue";
import { useTheme } from "../Context/ThemeContext";
import { FaQuestionCircle } from "react-icons/fa";
import HelpModal from "../components/ChatPage/HelpModal";

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
  const { currentTheme } = useTheme();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(isNewChat);

  // Suggestion examples
  const suggestions = [
    "What are the admission requirements for NSUT?",
    "How do I register for courses this semester?",
    "Tell me about the Computer Science department",
    "What extracurricular activities are available?"
  ];

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
          pollForUpdatedResponse(userId, parsedChat.messageId);
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

  const handleSendMessage = async (message, isDeepSearch = false) => {
    // Hide suggestions when a message is sent
    setShowSuggestions(false);
    
    const tempMessageId = `temp-${new Date().getTime()}`; // Temporary ID for UI update
  
    const updatedHistory = [
      ...chatHistory,
      {
        messageId: tempMessageId, // Assign temp ID initially
        query: message,
        response: "Processing...",
        references: [],
        status: "Processing",
      },
    ];
  
    setChatHistory(updatedHistory);
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat`,
        { chatId, message, userId, chatHistory, isDeepSearch }
      );
  
      const { chatId: newChatId, messageId } = response.data;
  
      setChatId(newChatId);
  
      // Update chat history by replacing tempMessageId with actual messageId
      const finalHistory = updatedHistory.map((item) =>
        item.messageId === tempMessageId ? { ...item, messageId } : item
      );
  
      setChatHistory(finalHistory);
      sessionStorage.setItem(
        "chatHistory",
        JSON.stringify({ chatId: newChatId, messageId, history: finalHistory })
      );
  
      if (isNewChat) {
        navigate(`/chat/${newChatId}`);
        return;
      }
  
      pollForUpdatedResponse(userId, messageId);
    } catch (error) {
      setChatHistory((prevHistory) =>
        prevHistory.map((item) =>
          item.messageId === tempMessageId
            ? {
                ...item,
                response: "Error fetching response. Try again.",
                references: [],
                status: "failed",
              }
            : item
        )
      );
    }
  };
  
  const pollForUpdatedResponse = (userId, messageId) => {
    const interval = setInterval(async () => {
      try {
        console.log("Making API call");
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/chat/response/${userId}`,
          { messageId }
        );
  
        console.log("Polling Response:", response.data);
  
        const { response: botResponse, references } = response.data;
  
        if (botResponse && botResponse !== "Processing") {
          const timestamp = new Date().getTime();
  
          setChatHistory((prevHistory) => {
            const newHistory = prevHistory.map((item) =>
              item.messageId === messageId
                ? {
                    ...item,
                    response: botResponse,
                    references: references || [],
                    status: "resolved",
                    timestamp,
                  }
                : item
            );
  
            // Ensure sessionStorage is updated
            sessionStorage.setItem(
              "chatHistory",
              JSON.stringify({ chatId, messageId, history: newHistory })
            );
  
            return newHistory;
          });
  
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

  // Handler for suggestion clicks
  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className={`relative h-screen w-full bg-[${currentTheme.background}] ${currentTheme.text} text-[16px] flex flex-col overflow-hidden`}>
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
          className="flex-grow flex sm:max-h-[80vh] max-h-[80vh] flex-col px-4 sm:px-10 overflow-y-auto pb-24 sm:pb-28 w-full"
        >
          {isNewChat === true ? (
            <div className="flex flex-col justify-center items-center mb- flex-grow">
              <h1 className="text-center text-5xl sm:text-5xl lg:text-5xl font-semibold bg-gradient-to-r from-violet-400 via-blue-400 to-pink-400 text-transparent bg-clip-text py-2">
                What can I help with?
              </h1>
              
              {/* Suggestion Chips - Redesigned */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div 
                    className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          delay: 0.1 * index,
                          duration: 0.5,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ 
                          scale: 1.03, 
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                          borderColor: "#4dabf7"
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="bg-gradient-to-br from-[#2a2a2a] to-[#303030] text-gray-200 p-5 rounded-xl cursor-pointer 
                          border border-gray-700 shadow-lg transition-all duration-300 text-sm sm:text-base
                          flex flex-col relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 
                          group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10">{suggestion}</span>
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 
                          transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
            <div className="flex justify-center">
              <ChatHistory chatHistory={chatHistory} />
            </div>
            </>
          )}
        </div>
      </div>

      {/* Input Box - Adjusted position to ensure it's below suggestions */}
      <motion.div
        className={`fixed left-0 bottom-6 right-0 z-10`}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <div className={`mx-auto my-2 px-4 flex justify-center`}> 
          <InputBox onSendMessage={handleSendMessage} setAlert={setAlert} />
        </div>
      </motion.div>

      {alert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-96 z-50">
          <Alert severity={alert.type}>{alert.text}</Alert>
        </div>
      )}

      {/* Scroll to Bottom Button */}
      <div>
        <ScrollCue showScrollButton={showScrollButton} chatContainerRef={chatContainerRef}/>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 mb-2 text-gray-400 text-xs font-extralight text-center whitespace-nowrap max-w-[90%]">
        <span>Mimir can make mistakes. Check important info.</span>
      </div>

      {/* Help Icon Button */}
      <motion.button
        className="fixed bottom-2 right-4 text-gray-400 hover:text-cyan-400 transition-colors z-10"
        whileHover={{ scale: 0.8, rotate: 5 }}
        whileTap={{ scale: 0.85 }}
        onClick={() => setShowHelpModal(true)}
        aria-label="Help and Information"
      >
        <FaQuestionCircle size={17} />
      </motion.button>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <HelpModal onClose={() => setShowHelpModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;