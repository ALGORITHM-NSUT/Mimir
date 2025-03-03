import React, { useState, useRef } from "react";
import { IoSend } from "react-icons/io5";
import SpeechButton from "./SpeechButton"; // Importing SpeechButton

const MAX_CHAR_LIMIT = 1500;

const InputBox = ({ onSendMessage, setAlert }) => {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textAreaRef = useRef(null);

  const handleSend = () => {  
    if (message.trim()) {
      onSendMessage(message);
      setMessage(""); // Clear input after sending
      adjustTextAreaHeight();
    } else {
      setAlert({ type: "error", text: "Please enter your query." });
    }
  };

  const handleChange = (e) => {
    if (e.target.value.length > MAX_CHAR_LIMIT) {
      alert(`Character limit of ${MAX_CHAR_LIMIT} exceeded!`);
      return;
    }
    setMessage(e.target.value);
    adjustTextAreaHeight();
  };

  const adjustTextAreaHeight = () => {
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.style.height = "auto";
      textArea.style.height = Math.min(textArea.scrollHeight, 120) + "px";
    }
  };

  return (
    <div
      className="fixed bottom-0 inset-x-0 min-h-40 rounded-t-3xl sm:min-h-20 flex items-center py-2 px-4 bg-[#303030] shadow-md shadow-gray-700 sm:relative sm:rounded-2xl sm:w-1/2 max-w-full overflow-hidden"
      onClick={() => textAreaRef.current?.focus()}
    >
      <textarea
        ref={textAreaRef}
        className="flex-1 p-3 text-md sm:text-base outline-none text-gray-100 bg-[#303030] placeholder-gray-400 rounded-lg resize-none overflow-auto max-h-[150px] min-h-[40px] w-full"
        placeholder="Ask Mimir..."
        value={message}
        maxLength={MAX_CHAR_LIMIT}
        onChange={handleChange}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
      />

      {/* Speech-to-Text Button */}
      <SpeechButton setMessage={setMessage} isListening={isListening} setIsListening={setIsListening} />


      {/* Send Button */}
      <button
        className="p-3 ml-2 text-gray-50 hover:text-gray-400 rounded-full bg-[#404040] hover:bg-[#505050] transition-all shadow-md"
        onClick={handleSend}
      >
        <IoSend size={22} />
      </button>
    </div>
  );
};

export default InputBox;
