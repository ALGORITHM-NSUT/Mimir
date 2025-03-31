import React from 'react';
import { motion, AnimatePresence } from "framer-motion";

const ScrollCue = ({ showScrollButton, chatContainerRef }) => {
  return (
    <AnimatePresence>
      {showScrollButton && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-36 inset-x-0 flex justify-center items-center cursor-pointer opacity-70 transition-opacity duration-300 z-10"
          onClick={() => chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' })}
        >
          <motion.div
            className="cursor-pointer absolute z-10 rounded-full bg-clip-padding text-token-text-secondary right-1/2 translate-x-1/2 bg-[#454444] text-gray-100 w-8 h-8 flex items-center justify-center bottom-5"
          >
             <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollCue;
