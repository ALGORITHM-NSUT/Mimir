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
  const userId = user.userId
  const [alert, setAlert] = useState(null)

  const [isNewChat, setIsNewChat] = useState(null);

  useEffect(()=>{
    if(location.pathname === "/new" && !isNewChat){
      setIsNewChat(true)
    }  
  },[])


  useEffect(()=>{
      if(alert){
        const timeout = setTimeout(()=>{
          setAlert(null);
        }, 2000);
        return ()=>clearTimeout(timeout)
      }
    }, [alert])



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

      setMessageId(messageId);  
      sessionStorage.setItem("chatHistory", JSON.stringify({ chatId: newChatId, messageId, history: updatedHistory }));


      if (isNewChat) {
        navigate(`/chat/${newChatId}`);
        return;
      }

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
<<<<<<< HEAD
  
=======

>>>>>>> 2591d6ab9e26845cff7a9258b5f74751f1d283b5
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
          sessionStorage.removeItem("chatHistory");
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
    <div className="relative h-screen w-full bg-[#1b1c1d] text-white text-[16px] flex flex-col overflow-hidden">
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
          className="flex-grow flex sm:max-h-[80vh] max-h-[80vh] flex-col px-4 sm:px-10 overflow-y-auto pb-24 sm:pb-28 w-full "
        >
          {isNewChat === true ? (
            <div className="flex flex-col justify-center items-center mb-20 flex-grow">
              <h1 className="text-center text-5xl sm:text-5xl lg:text-5xl font-semibold bg-gradient-to-r from-violet-400 via-blue-400 to-pink-400 text-transparent bg-clip-text py-2">
                What can I help with?
              </h1>
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

      <motion.div
        className={`fixed left-0 bottom-6 right-0 ${
          isNewChat ? "sm:bottom-48" : "sm:bottom-5"
        } `}
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
      <div >
        <ScrollCue showScrollButton={showScrollButton} chatContainerRef={chatContainerRef}/>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 mb-2 text-gray-400 text-xs font-extralight text-center whitespace-nowrap max-w-[90%]">
        <span>Mimir can make mistakes. Check important info.</span>
      </div>


    </div>
  );
};

export default ChatPage;