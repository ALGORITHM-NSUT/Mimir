import React, { useEffect, useState } from "react";

const statuses = [
  "Sending...",
  "Analyzing...",
  "Finding Relevant Documents...",
  "Finishing...",
];

const ChatLoader = () => {
  const [currentStatus, setCurrentStatus] = useState(statuses[0]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % statuses.length;
      setCurrentStatus(statuses[index]);
    }, 1500); // Change every 1.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-gray-800 text-gray-200 rounded-lg shadow-lg flex items-center justify-center h-24">
      <p className="text-lg font-medium animate-pulse">{currentStatus}</p>
    </div>
  );
};

export default ChatLoader;
