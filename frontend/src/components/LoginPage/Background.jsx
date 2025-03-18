import React from "react";

const Background = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-[-1]">
      <div className="flex gap-40">
        <div className="w-[400px] h-[400px] bg-red-500 blur-[100px] opacity-50 rounded-full"></div>
        <div className="w-[400px] h-[400px] bg-green-500 blur-[100px] opacity-50 rounded-full"></div>
        <div className="w-[400px] h-[400px] bg-blue-500 blur-[100px] opacity-50 rounded-full"></div>
      </div>
    </div>
  );
};

export default Background;
