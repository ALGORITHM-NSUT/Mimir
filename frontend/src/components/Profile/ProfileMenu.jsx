import React, { useState, useRef, useEffect, useContext } from "react";
import {
  FaUserCircle,
  FaShareAlt,
  FaCog,
  FaSignOutAlt,
  FaTimes,
  FaCopy,
  FaCheck
} from "react-icons/fa";
import axios from "axios";
import { useParams } from "react-router-dom";
import { UserContext } from "../../Context/UserContext.jsx";
import Alert from "@mui/material/Alert";

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const menuRef = useRef(null);
  const modalRef = useRef(null);
  const { chatId } = useParams();
  const { userId } = useContext(UserContext);

  // Toggle menu visibility
  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(()=>{
    if(alertMessage){
      const timeout = setTimeout(()=>{
        setAlertMessage(null);
      }, 2000);
      return ()=>clearTimeout(timeout)
    }
  }, [alertMessage])

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutsideModal = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutsideModal);
    }

    return () => document.removeEventListener("mousedown", handleClickOutsideModal);
  }, [isModalOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle "Share Chat" click
  const handleShareChat = async () => {
    console.log("Share Chat Clicked!");

    if (!chatId) {
      setAlertMessage({ type: "error", text: "Please start a Conversation" });
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat/share`, {
        chatId,
        userId,
      });

      setShareableLink(response.data.shareableLink);
      setIsModalOpen(true); // Open modal
      setAlertMessage(null); // Clear any error messages
    } catch (error) {
      console.error("Error making chat shareable:", error);
      setAlertMessage({ type: "error", text: "Failed to generate shareable link." });
    }
  };

  // Copy link to clipboard
  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // Preferred modern method
        await navigator.clipboard.writeText(shareableLink);
      } else {
        // Fallback for older browsers & mobile Safari
        const textArea = document.createElement("textarea");
        textArea.value = shareableLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
  
      setCopied(true);
      setAlertMessage({ type: "success", text: "Link copied to clipboard!" });
  
      setTimeout(() => {
        setCopied(false);
        setAlertMessage(null);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
      setAlertMessage({ type: "error", text: "Failed to copy link. Please try manually." });
    }
  };
  

  return (
    <div className="relative">
      {/* Profile Icon */}
      <div className="flex justify-end">
        <FaUserCircle className="text-xl sm:text-2xl cursor-pointer" onClick={toggleMenu} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] text-gray-100 rounded-xl shadow-lg z-50"
        >
          <ul className="py-2">
            <li
              className="px-4 py-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer rounded-md mx-2 transition-all"
              onClick={handleShareChat}
            >
              <FaShareAlt className="text-lg" />
              Share Chat
            </li>
            <li className="px-4 py-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer rounded-md mx-2 transition-all">
              <FaCog className="text-lg" />
              Settings
            </li>
            <li className="px-4 py-2 flex items-center gap-2 hover:bg-red-500 cursor-pointer rounded-md mx-2 transition-all">
              <FaSignOutAlt className="text-lg" />
              Logout
            </li>
          </ul>
        </div>
      )}

      {/* Alerts */}
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-96 z-50">
          <Alert severity={alertMessage.type}>{alertMessage.text}</Alert>
        </div>
      )}

      {/* Share Chat Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div ref={modalRef} className="bg-[#2a2a2a] text-gray-100 rounded-lg p-6 w-[90%] max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Share Chat</h2>
              <FaTimes className="cursor-pointer text-xl" onClick={() => setIsModalOpen(false)} />
            </div>
            <p className="text-sm text-gray-300 mb-4">Copy and share this link:</p>

            <div
              className="flex items-center justify-between bg-gray-800 p-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-700"
              onClick={copyToClipboard}
              role="button"
              aria-label="Copy shareable link"
            >
              <span className="truncate text-gray-300 px-2 w-full">
                {copied ? "Copied!" : shareableLink}
              </span>
              {copied ? <FaCheck className="text-green-400" /> : <FaCopy className="text-gray-400 hover:text-white transition" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
