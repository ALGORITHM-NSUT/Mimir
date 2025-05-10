import React from "react";
import ChatMessage from "./ChatMessage";
import LoadingMessage from "./LoadingMessage";

const ChatHistory = ({ chatHistory }) => {
  return (
    <div className=" mx-4 mt-6 sm:mt-12 md:w-[66%] w-full">
      {chatHistory.map((chat, index) => (
        <div key={index} className="mb-12">
          {index === chatHistory.length - 1 && chat.status === "Processing" ? (
            <LoadingMessage query={chat.query} />
          ) : (
            <ChatMessage query={chat.query} response={chat.response} references={chat.references} timestamp={chat.timestamp} messageId={chat.messageId} upvote= {chat?.upvote}/>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
