import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = ({ scrollToSection, featuresRef, faqRef, getStartedRef }) => {
  const navigate = useNavigate();

  return (
    <motion.nav
      className="sticky top-0 left-0 w-full bg-gray-950 sm:bg-transparent sm:backdrop-blur-xs text-black py-4 z-50 transition-transform duration-300"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    >
      <div className="container mx-auto flex justify-between items-center px-2 md:px-6">
        {/* Logo */}
        <motion.div
          className="flex justify-center items-center cursor-pointer"
          onClick={() => scrollToSection(getStartedRef)}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <img src="Mimir_logo.png" alt="Mimir Logo" className="h-8 sm:h-10 w-auto" />
          <h1 className="text-xl sm:text-2xl text-[#e5e4e4] font-semibold ml-2">Mimir</h1>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          className="flex justify-around space-x-6 text-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <div className="hidden sm:flex space-x-6 text-[#e5e4e4] font-semibold">
            <motion.button
              onClick={() => scrollToSection(featuresRef)}
              className="hover:text-gray-400"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              Features
            </motion.button>

            <motion.button
              onClick={() => scrollToSection(faqRef)}
              className="hover:text-gray-400"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              FAQ
            </motion.button>
          </div>

        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
