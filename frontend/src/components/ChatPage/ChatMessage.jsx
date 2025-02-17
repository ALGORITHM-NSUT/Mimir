import React from "react";
import Response from "./Response";
import References from "./References";

const ChatMessage = ({ query, response, references }) => {
  return (
    <div className="flex flex-col space-y-4">
      {/* User Query - Right aligned capsule */}
      <div className="flex justify-end">
        <div className="bg-[#2A2A2A] text-white px-4 py-2 rounded-2xl max-w-[75%]">
          {query}
        </div>
      </div>

      {/* AI Response - Below the query */}
      <div className="bg-[#2A2A2A] p-4 rounded-lg shadow-md max-w-[80%] flex sm:flex-row sm:justify-around">
        <Response text={response} />
        <References references={references} />
      </div>
    </div>
  );
};

export default ChatMessage;
