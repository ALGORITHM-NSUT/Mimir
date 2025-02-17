import React, { useState } from "react";
import { IoSend } from "react-icons/io5";

const InputBox = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage(""); // Clear input after sending
    }
  };

  return (
    <div className="flex items-center p-2 mx-6 rounded-lg w-full sm:w-3/4 md:w-1/2 bg-[#303030] shadow-md shadow-gray-700 max-w-lg">
      <input
        type="text"
        className="flex-1 p-3 text-sm sm:text-base outline-none text-gray-100 bg-[#303030] placeholder-gray-400 rounded-lg"
        placeholder="Ask Mimir..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button
        className="p-3 ml-2 text-gray-50 hover:text-gray-400 rounded-full bg-[#404040] hover:bg-[#505050] transition-all"
        onClick={handleSend}
      >
        <IoSend size={22} />
      </button>
    </div>
  );
};

export default InputBox;
