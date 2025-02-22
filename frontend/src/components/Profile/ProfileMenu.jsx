import React, { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaShareAlt, FaCog, FaSignOutAlt, FaTimes, FaCopy } from "react-icons/fa";
import axios from "axios";

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState("");
  const menuRef = useRef(null);
  const modalRef = useRef(null);

  // Toggle menu visibility
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

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
    console.log("Share Chat Clicked!"); // Debugging Log
    const currentUrl = window.location.href;
    const newUrl = `${currentUrl}?share=true`;

    try {
      // Make backend call to mark chat as shareable
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat/share`, { url: newUrl });

      setShareableLink(newUrl);
      setIsModalOpen(true); // Open modal
      console.log("Modal should open now!"); // Debugging Log
    } catch (error) {
      console.error("Error making chat shareable:", error);
    }
  };

  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
  };

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

  return (
    <div className="relative">
      {/* Profile Icon */}
      <div className="flex justify-end">
        <FaUserCircle className="text-xl sm:text-2xl cursor-pointer" onClick={toggleMenu} />
      </div>

      {/* Dropdown Menu */}
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

      {/* Share Chat Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div ref={modalRef} className="bg-[#2a2a2a] text-gray-100 rounded-lg p-6 w-[90%] max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Share Chat</h2>
              <FaTimes className="cursor-pointer text-xl" onClick={() => setIsModalOpen(false)} />
            </div>
            <p className="text-sm text-gray-300 mb-4">Copy and share this link:</p>
            <div className="flex items-center bg-gray-800 p-2 rounded-md">
              <input
                type="text"
                value={shareableLink}
                readOnly
                className="w-full bg-transparent text-gray-300 outline-none"
              />
              <FaCopy className="text-gray-400 cursor-pointer hover:text-white ml-2" onClick={copyToClipboard} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
