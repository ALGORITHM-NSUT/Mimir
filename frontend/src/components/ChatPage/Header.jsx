import React, { useState, useContext } from "react";
import { FaShareAlt, FaPencilAlt } from "react-icons/fa";
import { TbLayoutSidebarLeftExpandFilled } from "react-icons/tb";
import { useParams, useLocation, Link } from "react-router-dom";
import ProfileMenu from "../Profile/ProfileMenu";
import ShareChatModal from "../../modals/ShareChatModal";
import { UserContext } from "../../context/UserContext";

const Header = ({ toggleSidebar, setAlert, chatLoading }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const { chatId } = useParams();
  const location = useLocation();
  const { user, logoutUser } = useContext(UserContext);
  const userId = user?.userId;

  const handleNewChatClick = (e) => {
    if (location.pathname === "/new") {
      e.preventDefault();
      setAlert({ type: "error", text: "Already on New Chat Page." });
    }
  };

  const handleShareChat = () => {
    if (!chatId) {
      setAlert({ type: "error", text: "Please start a conversation" });
      return;
    }
    setIsShareModalOpen(true);
  };

  return (
    <header className="sticky top-0 left-0 w-full text-gray-50 py-3 px-6 grid grid-cols-3 items-center shadow-md bg-[#1b1c1d] z-100">
      {/* Left Section */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button onClick={toggleSidebar} className="text-white focus:outline-none">
          <TbLayoutSidebarLeftExpandFilled className="text-2xl sm:text-3xl" />
        </button>

        <Link to="/new" onClick={handleNewChatClick} className="sm:flex items-center hidden">
          <FaPencilAlt className="text-lg sm:text-xl" />
        </Link>
      </div>

      {/* Center Section */}
      <div className="flex items-center justify-center group">
        <span className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-blue-400 to-pink-400 text-transparent bg-clip-text text-center transition-all duration-300 group-hover:drop-shadow-[0_0_6px_rgba(147,197,253,0.2)]">
          Mimir
        </span>
        <span className="ml-2 text-xs border border-gray-500 text-gray-300 px-1.5 py-0.5 rounded-md">
          Beta
        </span>
      </div>


      {/* Right Section */}
      <div className="flex items-center justify-end gap-2">
        <div
          className="px-4 py-2 flex items-center gap-2 bg-[#1b1c1d] hover:bg-gray-700 text-white rounded-full cursor-pointer transition-all sm:border border-gray-600"
          onClick={handleShareChat}
        >
          <FaShareAlt className="text-base" />
          <span className="text-sm font-medium hidden sm:inline">Share</span>
        </div>
        <ProfileMenu />
      </div>

      {/* Animated Loading Bar */}
      {chatLoading && (
        <div className="absolute top-full left-0 w-full h-[4px] overflow-hidden">
          <div className="w-1/4 h-full bg-gradient-to-r from-blue-500 to-blue-700 animate-slide rounded-full" />
        </div>

      )}

      <ShareChatModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        chatId={chatId}
        userId={userId}
        setAlertMessage={setAlertMessage}
      />
    </header>
  );
};

export default Header;
