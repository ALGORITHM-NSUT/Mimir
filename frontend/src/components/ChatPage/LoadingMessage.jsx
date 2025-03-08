import React from "react";
import { FaMagic } from "react-icons/fa";
import ChatLoader from "../Utility/ChatLoader";

const LoadingMessage = ({ query }) => {
  return (
    <div className="space-y-4 w-full">
      
      <div className="flex justify-end">
        <div className="bg-[#2A2A2A] text-lg text-gray-300 px-4 py-3 rounded-3xl rounded-tr-none max-w-[80%] sm:max-w-[50%] break-words">
          {query}
        </div>
      </div>

      <div className="bg-[#2A2A2A] p-6 rounded-3xl rounded-tl-none shadow-[0px_5px_5px_rgba(0,0,0,0.3)] flex justify-center items-center">
        <div className="mt-2 max-w-full w-full">

          <FaMagic className="mb-4 text-purple-400 text-md" />

          <ChatLoader />
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
