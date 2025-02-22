import React from "react";
import { BsFileEarmarkTextFill } from "react-icons/bs";

const References = ({ references }) => {
  return (
    <div className="mt-2">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">References</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {references.map((ref, index) => (
          <a
            key={index}
            href={ref.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-xl shadow-lg transition duration-300 
            bg-gradient-to-r from-[#2E2E2E] via-[#2f2e2e] to-[#2E2E2E] 
            hover:from-[#3E3E3E] hover:via-[#525252] hover:to-[#3E3E3E]"
          >
            <div className="flex items-center gap-4">
              <BsFileEarmarkTextFill className="w-6 h-6 text-gray-400" />
              <div className="flex-1">
                <p className="text-gray-200 font-medium truncate">{ref.title || ref.url}</p>
                <p className="text-gray-400 text-sm truncate">{ref.url}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default References;
