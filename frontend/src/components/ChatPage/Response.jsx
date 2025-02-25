import React from "react";
import ReactMarkdown from "react-markdown";
import { FaMagic } from "react-icons/fa";

const Response = ({ text }) => {
  return (
    <div className="mt-2 max-w-full w-full">
      <FaMagic className="mb-4 text-purple-400 text-[16px]" />
      <div className="text-gray-300 text-sm md:text-base font-sans antialiased leading-relaxed break-words whitespace-pre-wrap overflow-hidden w-full max-w-full">
        <div className="prose-wrap prose prose-invert max-w-none ">
          {/* <ReactMarkdown> */}
            {text}
          {/* </ReactMarkdown> */}
        </div>
      </div>
    </div>
  );
};

export default Response;
