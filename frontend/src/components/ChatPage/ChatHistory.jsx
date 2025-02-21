import React from "react";
import ChatMessage from "./ChatMessage";

const ChatHistory = ({ chatHistory }) => {
  return (
    <div className="mx-4 mt-6 sm:mt-12">
      {chatHistory.map((chat, index) => (
        <div key={index} className="mb-12"> 
          <ChatMessage query={chat.query} response={chat.response} references={chat.references} />
        </div>
      ))}
    </div>

  );
};

export default ChatHistory;
