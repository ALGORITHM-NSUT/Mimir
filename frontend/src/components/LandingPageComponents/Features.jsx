import React from "react";
import { motion } from "framer-motion";
import features from "../../constants/features";

const Features = () => {
  return (
    <div className="px-4 sm:px-6 py-10 sm:py-20 mt-20 mb-10 min-h-[80vh] bg-gray-950 text-gray-100 flex flex-col items-center overflow-hidden w-full">
      {/* Heading */}
      <motion.div 
        className="text-center mb-10 sm:mb-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-5xl font-semibold">Why Choose Mimir?</h1>
      </motion.div>

      {/* Features List */}
      <div className="flex flex-col items-center justify-center mt-10 gap-16 sm:gap-20 w-full max-w-6xl">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="flex flex-col md:flex-row justify-between gap-10 md:gap-[10%] w-full"
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
          >
            {/* Text Section */}
            <motion.div 
              className="px-4 sm:px-6 w-full md:w-[45%] md:text-left"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <div className="flex flex-col justify-start gap-4">
                <motion.span
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {feature.icon}
                </motion.span>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
              </div>
              <p className="text-lg text-[#f5f5f5] leading-relaxed break-words whitespace-normal">
                {feature.description}
              </p>
            </motion.div>

            {/* Image Section */}
            <motion.div 
              className="flex justify-center max-w-full"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <img
                src={feature.image}
                alt={feature.title}
                className="w-full md:w-[800px] md:h-[400px] h-[300px] object-cover rounded-3xl shadow-md max-w-full"
              />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Features;
