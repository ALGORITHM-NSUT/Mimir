import React, { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaArrowRight } from "react-icons/fa6";
import ChatHistory from "../components/ChatPage/ChatHistory";
import { UserContext } from "../context/UserContext";
import AuthModal from "../modals/LoginModal";
import ContinueChatModal from "../modals/ContinueChatModal";

const SharedChatPage = () => {
  const { user } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const [isContinueModalOpen, setIsContinueModalOpen] = useState(false);
  const [navigateUrl, setNavigateUrl] = useState("");
  const navigate = useNavigate();

  
  useEffect(() => {
    if (location.state?.isContinueModalOpen) {
      setIsContinueModalOpen(true);
    }
  }, [location.state]); 


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


  }, [token, user]);

  const handleContinue = async () => {
    try {
      if (!user) {
        setNavigateUrl(`chat/shared?token=${token}`);
        setIsAuthModalOpen(true);
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/continue`,
        { token, newUserId: user.userId }
      );
      const { newChatId } = response.data;

      navigate(`/chat/${newChatId}`);
    } catch (err) {
      console.error("Error continuing chat:", err);
      setError("Failed to continue chat.");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#1b1c1d] text-white text-[16px] flex flex-col">
      <header className="w-full text-white h-14 py-4 px-6 flex items-center shadow-md bg-transparent backdrop-blur-3xl sticky z-10 top-0">
        <span className="absolute left-1/2 transform -translate-x-1/2 text-xl sm:text-2xl font-semibold bg-gradient-to-r from-blue-400 to-pink-400 text-transparent bg-clip-text text-center">
          Mimir
        </span>

        <button
          className="flex items-center bg-opacity-25 px-2 py-2 rounded-3xl bg-gray-50 gap-2 text-xs sm:text-base font-medium text-gray-200 ml-auto"
          onClick={handleContinue}
        >
          Continue <FaArrowRight className="h-3 sm:h-4 w-auto" />
        </button>
      </header>

      <div className="flex justify-center">
        <ChatHistory chatHistory={chatHistory} />
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} navigateUrl={navigateUrl} />
      <ContinueChatModal isOpen={isContinueModalOpen} onClose={() => setIsContinueModalOpen(false)} onContinue={handleContinue} />

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
};

export default SharedChatPage;
