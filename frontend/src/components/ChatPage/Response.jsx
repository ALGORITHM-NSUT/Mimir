import React from "react";
import { motion } from "framer-motion";
import { FaMagic } from "react-icons/fa";


const Response = ({ text = "Hello, this is a test!" }) => {
  const words = text?.trim() ? text.split(" ") : ["No", "text", "provided"];
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mt-2 max-w-full w-full"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <FaMagic className="mb-4 text-purple-400 text-md" />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.1 }}
          className="text-white text-sm md:text-base font-sans antialiased leading-relaxed break-words whitespace-pre-wrap w-full max-w-full"
        >
          <div className="overflow-auto">
            <motion.div animate={{ opacity: 1 }} className="prose prose-invert max-w-none break-words whitespace-pre-wrap">
              {words.map((word, index) => (
                <motion.span 
                  key={index} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    );
  // else {
  //   // Render plain text if response is ready
  //   return (
  //     <div className="text-white text-sm md:text-base font-sans antialiased leading-relaxed break-words whitespace-pre-wrap w-full max-w-full">
  //       {text}
  //     </div>
  //   );
  // }
};

export default Response;
