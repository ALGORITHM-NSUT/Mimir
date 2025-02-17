import React from "react";

const Response = ({ text }) => {
  return (
    <div className="mt-2">
      <h3 className="text-lg font-semibold text-gray-300">Response</h3>
      <p className="text-gray-300">{text}</p>
    </div>
  );
};

export default Response;
