import React, { useState, useRef, useEffect, useContext } from "react";
import {
  FaUserCircle,
  FaShareAlt,
  FaCog,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import axios from "axios";
import { useParams } from "react-router-dom";
import { UserContext } from "../../Context/UserContext.jsx";
import Alert from "@mui/material/Alert";
import LogoutConfirmationModal from "../../modals/LogoutConfirmationModal.jsx";
import ShareChatModal from "../../modals/ShareChatModal.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const menuRef = useRef(null);
  const { chatId } = useParams();
  const { user, logoutUser } = useContext(UserContext);
  const userId = user?.userId;

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const toggleSettings = () => setIsSettingsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShareChat = () => {
    if (!chatId) {
      setAlertMessage({ type: "error", text: "Please start a conversation" });
      return;
    }
    setIsShareModalOpen(true);
  };

  return (
    <div className="relative">
      <div className="flex justify-end">
        <FaUserCircle className="text-xl sm:text-2xl cursor-pointer" onClick={toggleMenu} />
      </div>

      {isOpen && (
        <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] text-gray-100 rounded-xl shadow-lg z-50">
          <ul className="py-2">
            {/* <li
              className="px-4 py-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer rounded-md mx-2 transition-all"
              onClick={handleShareChat}
            >
              <FaShareAlt className="text-lg" />
              Share Chat
            </li> */}
            <li
              className="px-4 py-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer rounded-md mx-2 transition-all"
              onClick={toggleSettings}
            >
              <FaCog className="text-lg" />
              Settings
            </li>
            <li
              className="px-4 py-2 mt-1 flex items-center gap-2 hover:bg-red-500 cursor-pointer rounded-md mx-2 transition-all"
              onClick={() => setIsLogoutModalOpen(true)}
            >
              <FaSignOutAlt className="text-lg" />
              Logout
            </li>
          </ul>
        </div>
      )}

      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-96 z-50">
          <Alert severity={alertMessage.type}>{alertMessage.text}</Alert>
        </div>
      )}

      {/* <ShareChatModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        chatId={chatId}
        userId={userId}
        setAlertMessage={setAlertMessage}
      /> */}

      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logoutUser}
      />

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal 
            onClose={toggleSettings}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// 🛠️ Settings Modal Component
const SettingsModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("account");

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] 
        flex items-center justify-center p-4"
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#303030] rounded-xl p-6 max-w-md w-full shadow-xl
          border border-gray-700"
        style={{ height: '400px', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <FaCog size={24} className="text-cyan-400" />
          <h2 className="text-xl font-semibold text-gray-100">Settings</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-600 mb-6">
          <button 
            className={`flex-1 p-2 ${activeTab === "account" ? "border-b-2 border-cyan-400 text-cyan-400" : "text-gray-300"}`} 
            onClick={() => setActiveTab("account")}
          >
            Account
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto mb-6">
          {activeTab === "account" && (
            <div className="bg-[#404040] rounded-lg p-4">
              <p className="text-gray-200">👤 Logged in as <b>User</b></p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-auto">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 text-white
              hover:bg-cyan-700 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default ProfileMenu;
