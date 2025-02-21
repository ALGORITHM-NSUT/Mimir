import React from "react";
import { FaFilePdf, FaGlobe } from "react-icons/fa";
import { BsFileEarmarkTextFill } from "react-icons/bs";

const References = ({ references }) => {
  return (
    <div className="mt-2">
      <h3 className="text-lg font-semibold text-gray-300 mb-4">References</h3>
      <ul className="list-disc pl-4 space-y-3">
        {references.map((ref, index) => (
          <li key={index} className="flex items-center gap-4">
            <BsFileEarmarkTextFill className="w-6 h-auto" />
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-400 underline truncate max-w-[80%] break-all"
            >
              {ref.title || ref.url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default References;
