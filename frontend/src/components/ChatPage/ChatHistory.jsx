import React from "react";
import ChatMessage from "./ChatMessage";

const ChatHistory = ({ chatHistory }) => {
  return (
    <div className="space-y-4 sm:px-12">
      {chatHistory.map((chat, index) => (
        <ChatMessage key={index} query={chat.query} response={chat.response} references={chat.references} />
      ))}
    </div>
  );
};

export default ChatHistory;
