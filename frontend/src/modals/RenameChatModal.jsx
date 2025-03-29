import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const RenameChatModal = ({ isOpen, onClose, chatId, userId, setChats }) => {
  const [newTitle, setNewTitle] = useState("");

  const handleRenameChat = async () => {
    if (!newTitle.trim()) return;
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/changeTitle/${chatId}`,
        { userId, newTitle },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        console.log("Chat renamed successfully:", response.data);

        const storedChats = JSON.parse(sessionStorage.getItem(`chats_${userId}`)) || [];
        const updatedChats = storedChats.map(chat =>
          chat.chatId === chatId ? { ...chat, title: newTitle } : chat
        );
        sessionStorage.setItem(`chats_${userId}`, JSON.stringify(updatedChats));

        setChats(updatedChats);
        onClose();
      } else {
        console.error("Failed to rename chat");
        alert("Failed to rename chat. Please try again.");
      }
    } catch (error) {
      console.error("Rename chat error:", error);
      alert("An error occurred while renaming the chat. Please try again.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRenameChat();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-[#252627] p-6 rounded-lg shadow-lg w-96"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <h2 className="text-white text-lg font-semibold mb-4">Rename Chat</h2>
        <input
          type="text"
          placeholder="Enter new chat title"
          className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <div className="flex justify-end mt-4">
          <motion.button 
            onClick={onClose} 
            className="px-4 py-2 text-gray-300 hover:text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={handleRenameChat}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Rename
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RenameChatModal;
