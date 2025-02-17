import React from "react";

const References = ({ references }) => {
  return (
    <div className="mt-3">
      <h3 className="text-lg font-semibold text-gray-300">References</h3>
      <ul className="list-disc pl-4">
        {references.map((ref, index) => (
          <li key={index}>
            <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              {ref.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default References;
