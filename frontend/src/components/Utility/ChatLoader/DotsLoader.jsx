import React from 'react';
import { motion } from 'framer-motion';

const DotsLoader = () => {
  const dotVariants = {
    animate: {
      y: ['0%', '-50%', '0%'],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="flex items-center p-4 bg-[#2A2A2A] rounded-lg gap-2">
      <span className="text-gray-300"></span>
      <motion.div 
        className="flex gap-1"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-gray-300 rounded-full"
            variants={dotVariants}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default DotsLoader;