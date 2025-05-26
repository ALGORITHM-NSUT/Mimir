import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/ChatPage/Sidebar";
import InputBox from "../components/ChatPage/InputBox";
import ChatHistory from "../components/ChatPage/ChatHistory";
import Header from "../components/ChatPage/Header";
import { UserContext } from "../context/UserContext";
import Alert from "@mui/material/Alert";
import { motion, AnimatePresence } from "framer-motion";
import ScrollCue from "../components/ChatPage/ScrollCue";
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
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(isNewChat);
  const [chatLoading, setChatLoading] = useState(false);


  // Suggestion examples
  const suggestions = [
    "Tell me details about annual sports day 2025",
    "Give me academic calendar for 2025",
    "Tell me about the Computer Science department",
    "How to register for algorithm east society of nsut"
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
      setChatLoading(true);
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
    } finally {
      setTimeout(() => {
        setChatLoading(false);
      }, 1200);
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
            sessionStorage.removeItem(
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
        setShowScrollButton(scrollTop + clientHeight < scrollHeight);
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
    <div className={`relative w-full text-[16px] bg-[#1b1c1d] flex flex-col h-screen`}>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        sidebarRef={sidebarRef}
        setAlert={setAlert}
      />

      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} setAlert={setAlert} chatLoading = {chatLoading} />
   

        {/* Chat History Section */}
        <div
          ref={chatContainerRef}
          className="flex-grow flex sm:max-h-[80vh] max-h-[80vh] flex-col px-4 sm:px-10 overflow-y-auto pb-24 sm:pb-28 w-full"
        >
          {isNewChat === true ? (
            <div className="flex flex-col justify-center items-center md:mt-10 flex-grow">
              <h1 className="text-center text-5xl font-semibold bg-gradient-to-r from-violet-400 via-blue-400 to-pink-400 text-transparent bg-clip-text py-2">
                What can I help with?
              </h1>
              
              <motion.div
                      className="mt-4 md:mt-6 text-cyan-400 transition-colors cursor-pointer flex flex-col items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      onClick={() => document.getElementById('inputBox')?.focus()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <p className="text-sm ">Try asking about these topics</p>
                      <p className="text-gray-500 text-xs"> (Knowlege cutoff: 1 Jan 2024) </p>
                    </motion.div>

              {/* Redesigned Suggestion Section */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    className="mt-6 md:mt-8 flex flex-col items-center w-full max-w-3xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.p
                      className="text-gray-400 mb-2 md:mb-4 text-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      
                    </motion.p>

                    <div className="grid md:grid-cols-2 gap-4 sm:w-[80%]">
                      {suggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.2 + (0.1 * index),
                            duration: 0.5,
                            type: "spring",
                            stiffness: 100
                          }}
                          whileHover={{
                            scale: 1.03,
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="bg-gradient-to-br from-[#2a2a2a] to-[#303030] text-gray-200 p-3 lg:p-5 rounded-xl cursor-pointer 
                            border border-gray-700 shadow-lg transition-all duration-300 text-sm sm:text-base
                            flex items-center relative overflow-hidden group"
                        >
                          {/* Icon based on suggestion content */}
                          <div className="mr-3 text-cyan-400 opacity-80 group-hover:opacity-100 transition-opacity">
                            {index === 0 ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.328.996.002 1.069c0 .527.213 1.028.589 1.405a.989.989 0 001.41 0l.002-.003.161.161a1.5 1.5 0 002.121 0L13.5 10.17l2.394 1.02a1 1 0 001.212-1.32l-7-8a1 1 0 00-1.706 0l-7 8a1 1 0 001.212 1.32l3.788-1.623a.5.5 0 01.394.925l-3.74 1.599a1 1 0 00-.394 1.56l5.5 6.6a1 1 0 001.548 0l5.5-6.6a1 1 0 00-.394-1.56l-5.5-2.354a.5.5 0 01-.394-.925l2.2-.939a1 1 0 00.394-1.56l-3.5-4.2a1 1 0 00-1.548 0l-3.5 4.2a1 1 0 00.394 1.56l4.606 1.975a.5.5 0 01-.394.925L8.5 11.283v-.001a.85.85 0 00-.568-.232.486.486 0 00-.497.498c0 .28.22.5.497.5.273 0 .5-.22.5-.5v.001l.002-1.069 2.328-.996a1 1 0 00-.788-1.838l-4 1.714a.992.992 0 00-.356.257l-2.644-1.131a1 1 0 000-1.84l7-3a1 1 0 00.788 0l-7 3a1 1 0 010 1.84l7 3a1 1 0 01.788 0l-7-3a1 1 0 010-1.84l7-3z" />
                              </svg>
                            ) : index === 1 ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                              </svg>
                            ) : index === 2 ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                              </svg>
                            )}
                          </div>

                          <div className="flex-grow">
                            <span className="relative z-10">{suggestion}</span>
                          </div>

                          <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>

                          {/* highlight effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 
                            group-hover:opacity-100 transition-opacity duration-300"></div>

                          {/*bottom border */}
                          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 
                            transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      className="mt-6 text-cyan-400 transition-colors cursor-pointer flex flex-col items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      onClick={() => document.getElementById('inputBox')?.focus()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                    </motion.div>
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


      <motion.div
        className={`fixed left-0 bottom-0 right-0 z-10 bg-[#1b1c1d] `}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <div className={`mx-auto my-2 px-4 flex justify-center`}>
          <InputBox onSendMessage={handleSendMessage} setAlert={setAlert} />
        </div>
        
        <div className="relative flex justify-center items-center bg-[#1b1c1d] mb-2">
          <span className="text-center text-xs font-extralight text-gray-400 whitespace-nowrap">
            Mimir can make mistakes. Check important info.
            <span className="hidden sm:inline"> (Knowledge cutoff: 1 Jan 2024)</span>
          </span>

          <div
            onClick={() => setShowHelpModal(true)}
            className="absolute right-4 text-gray-400 hover:text-white cursor-pointer transition-colors duration-200"
          >
            <FaQuestionCircle size={20} />
          </div>
 


        </div>

      </motion.div>


      {alert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-96 z-50">
          <Alert severity={alert.type}>{alert.text}</Alert>
        </div>
      )}

      
    
      <div>
        <ScrollCue showScrollButton={showScrollButton} chatContainerRef={chatContainerRef} />
      </div>



  
      <AnimatePresence>
        {showHelpModal && (
          <HelpModal onClose={() => setShowHelpModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;