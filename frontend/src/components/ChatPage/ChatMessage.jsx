import React from "react";
import Response from "./Response";
import References from "./References";

const ChatMessage = ({ query, response, references }) => {
  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-end">
        <div className="bg-[#2A2A2A] text-lg text-gray-300 px-4 py-3 rounded-3xl rounded-tr-none max-w-[80%] sm:max-w-[50%] break-words">
          {query}
        </div>
      </div>

      <div className="bg-[#2A2A2A] p-6 rounded-3xl rounded-tl-none shadow-[0px_5px_5px_rgba(0,0,0,0.3)] flex flex-col sm:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <Response text={response} />
        </div>

        <div className="hidden sm:block w-[2px] bg-gray-500"></div>
        <div className="sm:hidden h-[2px] bg-gray-500 my-4"></div>

        <div className="flex-1 min-w-0">
          <References references={references} />
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
