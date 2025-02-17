import React, { useState } from "react";
import { TbLayoutSidebarLeftExpandFilled } from "react-icons/tb";
import { FaUserCircle } from "react-icons/fa";
import Sidebar from "../components/ChatPage/Sidebar";
import InputBox from "../components/ChatPage/InputBox";
import ChatHistory from "../components/ChatPage/ChatHistory";

const ChatPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isSent, setIsSent] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSendMessage = (message) => {
    setIsSent(true);
    const newMessage = {
      query: message,
      response: `This is a generated response for: "${message}"`,
      references: [
        { title: "Reference 1", url: "https://example.com/ref1" },
        { title: "Reference 2", url: "https://example.com/ref2" },
      ],
    };
    setChatHistory((prevHistory) => [...prevHistory, newMessage]);
  };

  return (
    <div className="relative flex h-screen bg-[#212121] text-white">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="w-full bg-[#2A2A2A] text-white py-4 px-6 flex justify-between items-center shadow-md">
          <button onClick={toggleSidebar} className="text-white">
            <TbLayoutSidebarLeftExpandFilled className="text-2xl" />
          </button>
          <img src="Mimir_logo.png" alt="Mimir Logo" className="h-8" />
          <FaUserCircle className="text-2xl cursor-pointer" />
        </header>

        {/* Chat Section */}
        <div className={`flex-1 overflow-auto p-4 transition-all duration-500 ${isSent ? "pt-4" : "flex items-center justify-center"}`}>
          {!isSent && (
            <div className="text-center text-5xl sm:text-[60px] font-semibold text-gray-400 animate-fadeIn">
              Ask Mimir about <br /> University Notices and Circulars
            </div>
          )}
          <ChatHistory chatHistory={chatHistory} />
        </div>

        {/* Input Box */}
        <div className={`transition-all duration-500 flex justify-center w-full ${isSent ? "absolute bottom-7 left-0 p-4 bg-[#212121]" : "items-center flex-1"}`}>
          <InputBox onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
