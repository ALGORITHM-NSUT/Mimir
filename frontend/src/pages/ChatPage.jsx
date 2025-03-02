import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/ChatPage/Sidebar";
import InputBox from "../components/ChatPage/InputBox";
import ChatHistory from "../components/ChatPage/ChatHistory";
import Header from "../components/ChatPage/Header";
import { UserContext } from "../Context/UserContext";
import ChatLoader from "../components/Utility/ChatLoader";
import Alert from "@mui/material/Alert";


const ChatPage = () => {
  const { chatId: urlChatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [chatId, setChatId] = useState(urlChatId || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const isNewChat = !urlChatId;
  const sidebarRef = useRef(null);
  const chatContainerRef = useRef(null);
  const { user } = useContext(UserContext);
  const userId = user.userId
  const [isLoading, setisLoading] = useState(false);  
  const [alert, setAlert] = useState(null)



  useEffect(()=>{
      if(alert){
        const timeout = setTimeout(()=>{
          setAlert(null);
        }, 2000);
        return ()=>clearTimeout(timeout)
      }
    }, [alert])



  useEffect(() => {
    if (urlChatId) {
      setChatId(urlChatId);
      fetchChatHistory(urlChatId);
    }
  }, [urlChatId]);

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

  const fetchChatHistory = async (chatId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/${chatId}?userId=${userId}`
      );
      setChatHistory(response.data.chatHistory || []);
    } catch (error) {
      navigate("/new");
    }
  };

  const handleSendMessage = async (message) => {
    setisLoading(true)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat`,
        { chatId, message, userId, chatHistory}
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
      setChatHistory((prevHistory) => [
        ...prevHistory,
        {
          query: message,
          response: "Error fetching response. Try again.",
          references: [],
        },
      ]);
    }finally{
      setisLoading(false)
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#1b1c1d] text-white text-[16px] flex flex-col">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        sidebarRef={sidebarRef}
        setAlert={setAlert}
      />


      <div className="flex flex-col flex-grow">
        {/* Header Section */}
        <Header
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}  
          setAlert={setAlert}
        />

        {/* Chat History Section */}
        <div
          ref={chatContainerRef}
          className="flex-grow flex sm:max-h-[90vh] max-h-[85vh] flex-col px-4 sm:px-10 overflow-y-auto pb-24 sm:pb-28"
        >
          {isNewChat && chatHistory.length === 0 ? (
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

      {/* Fixed Input Box */}
      <div
        className={`fixed w-full p-4 h-32 bg-[#1b1c1d] flex items-center justify-center transition-all duration-500 ${
          isNewChat ? "bottom-48" : "bottom-0" 
        }`}
      >
        <InputBox 
          onSendMessage={handleSendMessage}
          setAlert={setAlert}
        />
      </div>
      {alert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-96 z-50">
          <Alert severity={alert.type}>{alert.text}</Alert>
        </div>
      )}
    </div>


  );
};

export default ChatPage;
