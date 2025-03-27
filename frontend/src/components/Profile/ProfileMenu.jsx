import React, { useState, useRef, useEffect, useContext } from "react";
import {
  FaUserCircle,
  FaShareAlt,
  FaCog,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaUser,
} from "react-icons/fa";
import { MdColorLens } from "react-icons/md";
import axios from "axios";
import { useParams } from "react-router-dom";
import { UserContext } from "../../Context/UserContext.jsx";
import Alert from "@mui/material/Alert";
import LogoutConfirmationModal from "../../modals/LogoutConfirmationModal.jsx";
import ShareChatModal from "../../modals/ShareChatModal.jsx";

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [theme, setTheme] = useState("dark");
  const menuRef = useRef(null);
  const { chatId } = useParams();
  const { user, logoutUser } = useContext(UserContext);
  const userId = user?.userId;

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const toggleSettings = () => setIsSettingsOpen((prev) => !prev);
  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  useEffect(() => {
    if (alertMessage) {
      const timeout = setTimeout(() => setAlertMessage(null), 2000);
      return () => clearTimeout(timeout);
    }
  }, [alertMessage]);

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
            <li
              className="px-4 py-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer rounded-md mx-2 transition-all"
              onClick={handleShareChat}
            >
              <FaShareAlt className="text-lg" />
              Share Chat
            </li>
            <li
              className="px-4 py-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer rounded-md mx-2 transition-all"
              onClick={toggleSettings}
            >
              <FaCog className="text-lg" />
              Settings
            </li>
            <li
              className="px-4 py-2 flex items-center gap-2 hover:bg-red-500 cursor-pointer rounded-md mx-2 transition-all"
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

      <ShareChatModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        chatId={chatId}
        userId={userId}
        setAlertMessage={setAlertMessage}
      />

      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logoutUser}
      />

      {isSettingsOpen && <SettingsModal onClose={toggleSettings} theme={theme} toggleTheme={toggleTheme} />}
    </div>
  );
};

// 🛠️ Settings Modal Component
const SettingsModal = ({ onClose, theme, toggleTheme }) => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[#2a2a2a] text-white w-[350px] p-6 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-500 mb-4">
          <button className={`flex-1 p-2 ${activeTab === "general" ? "border-b-2 border-blue-400" : ""}`} onClick={() => setActiveTab("general")}>General</button>
          <button className={`flex-1 p-2 ${activeTab === "theme" ? "border-b-2 border-blue-400" : ""}`} onClick={() => setActiveTab("theme")}>Theme</button>
          <button className={`flex-1 p-2 ${activeTab === "account" ? "border-b-2 border-blue-400" : ""}`} onClick={() => setActiveTab("account")}>Account</button>
        </div>

        {/* Content */}
        <div>
          {activeTab === "general" && (
            <div className="space-y-2">
              <p>⚙️ General settings coming soon...</p>
            </div>
          )}

          {activeTab === "theme" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Dark Mode</span>
                <button onClick={toggleTheme} className="p-2 bg-gray-700 rounded-md">
                  {theme === "dark" ? <FaMoon className="text-yellow-300" /> : <FaSun className="text-yellow-500" />}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span>Accent Color</span>
                <button className="p-2 bg-blue-500 rounded-md">
                  <MdColorLens className="text-white" />
                </button>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-2">
              <p>👤 Logged in as <b>User</b></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileMenu;
