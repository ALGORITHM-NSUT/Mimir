import React from "react";
import { motion } from "framer-motion";

// Update to accept collapse as a prop
const RightPanel = () => {
  return (
    <motion.div
      initial={{ width: "0%", opacity: 1 }}
      animate={{ width: "40%", opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 top-0 h-full p-4 bg-gray-500 shadow-lg overflow-auto"
    >
      <h2 className="text-xl font-bold text-white">Response</h2>

      {/* Scrollable response area */}
      <div className="mt-2 text-white flex-1 overflow-y-auto max-h-[70vh]">
        <p>Generating response...</p>
        <p>Response content goes here...</p>
        {/* Add more text to test scrolling */}
        <p>Lorem ipsum dolor sit amet...</p>
        <p>More content...</p>
        <p>Even more content...</p>
      </div>
    </motion.div>
  );
};

export default RightPanel;
