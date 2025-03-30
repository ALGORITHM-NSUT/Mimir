import React from "react";
import Response from "./Response";
import References from "./References";

const ChatMessage = ({ query, response, references,timestamp }) => {
  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-end">
        <div className="bg-[#2A2A2A] text-lg text-gray-300 px-4 py-3 rounded-3xl rounded-tr-none max-w-[80%] sm:max-w-[50%] break-words">
          {query}
        </div>
      </div>

      <div className="bg-[#2A2A2A] p-6 rounded-3xl rounded-tl-none shadow-[0px_5px_5px_rgba(0,0,0,0.3)] flex flex-col gap-6">
      <div className="bg-transparent rounded-3xl rounded-tl-none flex flex-col gap-6">
        <div className="flex-1 min-w-0">
          <Response text={response} timestamp={timestamp} />
        </div>

     
        <References references={references} />

      </div>
    </div>
    </div>
  );
};

export default ChatMessage;
