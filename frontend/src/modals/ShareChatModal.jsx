import React, { useEffect, useRef, useState } from "react";
import { FaTimes, FaCopy, FaCheck } from "react-icons/fa";
import axios from "axios";

const ShareChatModal = ({ isOpen, onClose, chatId, userId, setAlertMessage }) => {
  const [shareableLink, setShareableLink] = useState("");
  const [copied, setCopied] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchShareableLink = async () => {
      const cachedLink = sessionStorage.getItem(`shareableLink_${chatId}`);
      if (cachedLink) {
        setShareableLink(cachedLink);
        return;
      }

      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat/share`, {
          chatId,
          userId,
        });
        const link = response.data.shareableLink;
        sessionStorage.setItem(`shareableLink_${chatId}`, link);
        setShareableLink(link);
      } catch (error) {
        console.error("Error making chat shareable:", error);
        setAlertMessage({ type: "error", text: "Failed to generate shareable link." });
      }
    };

    fetchShareableLink();
  }, [isOpen, chatId, userId, setAlertMessage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setAlertMessage({ type: "success", text: "Link copied to clipboard!" });

      setTimeout(() => {
        setCopied(false);
        setAlertMessage(null);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
      setAlertMessage({ type: "error", text: "Failed to copy link." });
    }
  };

  return isOpen ? (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[50]">
    <div
      ref={modalRef}
      className="bg-[#2a2a2a] text-gray-100 rounded-lg p-6 w-[90%] max-w-md shadow-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Share Chat</h2>
        <FaTimes className="cursor-pointer text-xl" onClick={onClose} />
      </div>

      <p className="text-sm text-gray-300 mb-4">Copy and share this link:</p>

      <div
        className="flex items-center justify-between bg-gray-800 p-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-700"
        onClick={copyToClipboard}
      >
        <span className="truncate text-gray-300 px-2 w-full">
          {copied ? "Copied!" : shareableLink}
        </span>
        {copied ? (
          <FaCheck className="text-green-400" />
        ) : (
          <FaCopy className="text-gray-400 hover:text-white transition" />
        )}
      </div>
    </div>
  </div>
) : null;

};

export default ShareChatModal;
