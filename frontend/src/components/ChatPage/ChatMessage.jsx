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

      <div className="bg-transparent p-6 rounded-3xl rounded-tl-none flex flex-col gap-6">
        <div className="flex-1 min-w-0">
          <Response text={response} />
        </div>

     
        <References references={references} />

      </div>
    </div>
  );
};

export default ChatMessage;
