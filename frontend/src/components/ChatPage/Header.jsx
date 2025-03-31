import React, { useState, useRef, useEffect, useContext } from "react";

import { FaShareAlt } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { TbLayoutSidebarLeftExpandFilled } from "react-icons/tb";
import { FaPencilAlt, FaUserCircle } from "react-icons/fa";
import ProfileMenu from "../Profile/ProfileMenu";
import ShareChatModal from "../../modals/ShareChatModal";
import { UserContext } from "../../Context/UserContext";

const Header = ({ toggleSidebar, setAlert }) => {


  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState(null);
  const { chatId } = useParams();
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
    <header className="w-full text-white py-4 px-6 grid grid-cols-3 items-center shadow-md bg-[#1b1c1d]">
      {/* Left Section */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button onClick={toggleSidebar} className="text-white focus:outline-none">
          <TbLayoutSidebarLeftExpandFilled className="text-2xl sm:text-3xl" />
        </button>

        <Link to="/new" onClick={handleNewChatClick} className="sm:flex items-center hidden">
          <FaPencilAlt className="text-lg sm:text-xl" />
        </Link>
      </div>

      {/* Center - Title with Beta Badge */}
      <div className="flex items-center justify-center">
        <span className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-blue-400 to-pink-400 text-transparent bg-clip-text text-center">
          Mimir
        </span>
        <span className="ml-2 text-xs border border-gray-500 text-gray-300 px-1.5 py-0.5 rounded-md">
          Beta
        </span>
      </div>
      
      {/* Right Section - Profile and Share */}
      <div className="flex items-center justify-end gap-2">
        <div className="px-3 py-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer rounded-md transition-all"
          onClick={handleShareChat}>
          <FaShareAlt className="text-lg" />
        </div>
        <ProfileMenu />
      </div>
      
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
