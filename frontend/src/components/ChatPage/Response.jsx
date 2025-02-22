import React from "react";
import ReactMarkdown from "react-markdown";
import { FaMagic } from "react-icons/fa";

const Response = ({ text }) => {
  return (
    <div className="mt-2 max-w-full w-full">
      <FaMagic className="mb-4 text-purple-400 text-[16px]" />
      <div className="text-gray-300 prose prose-invert break-words whitespace-pre-wrap overflow-hidden w-full max-w-full">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              return !inline ? (
                <pre className="p-3 bg-gray-900 text-white rounded-md overflow-x-auto">
                  <code {...props} className="whitespace-pre-wrap break-words">
                    {children}
                  </code>
                </pre>
              ) : (
                <code {...props} className="px-1 py-0.5 bg-gray-700 rounded">
                  {children}
                </code>
              );
            },
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default Response;
