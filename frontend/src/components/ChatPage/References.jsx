import React from "react";
import { BsFileEarmarkTextFill } from "react-icons/bs";
import { motion } from "framer-motion";

const References = ({ references }) => {
  if (references.length === 0) return null;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mt-4 bg-gradient-to-br from-[#1a1b1f] to-[#2a2b2f] rounded-3xl p-8 backdrop-blur-lg border border-gray-800/30"
    >
      <motion.h3 
        className="text-xl font-bold text-gray-100 mb-6 flex items-center gap-3"
        variants={itemVariants}
      >
        <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          References
        </span>
      </motion.h3>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
        variants={containerVariants}
      >
        {references.map((ref, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <a
              href={ref.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <div className="group relative p-5 rounded-2xl transition-all duration-300 ease-in-out
                bg-gradient-to-br from-gray-900/80 to-gray-800/80
                border border-gray-700/50
                shadow-lg hover:shadow-xl overflow-hidden">
                
                {/* Background gradient that transitions smoothly */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 
                  group-hover:from-purple-500/5 group-hover:to-blue-500/5 
                  transition-all duration-500 ease-in-out" />

                <div className="relative flex items-center gap-4 z-10">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 
                    transition-all duration-300 ease-in-out
                    group-hover:from-purple-500/20 group-hover:to-blue-500/20">
                    <BsFileEarmarkTextFill className="w-5 h-5 text-purple-400 
                      transition-colors duration-300 ease-in-out
                      group-hover:text-purple-300" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200 font-medium text-sm mb-1 w-full overflow-hidden truncate
                      transition-colors duration-300 ease-in-out
                      group-hover:text-white">
                      {ref.title}
                    </p>
                    <p className="text-gray-500 text-xs w-full overflow-hidden truncate
                      transition-colors duration-300 ease-in-out
                      group-hover:text-gray-400">
                      {ref.link}
                    </p>
                  </div>
                </div>
              </div>
            </a>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default References;