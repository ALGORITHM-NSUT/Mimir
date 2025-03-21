import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ScrollPrompt from "./ScrollPrompt";

const GetStarted = () => {
  const navigate = useNavigate();
  const [showScrollPrompt, setShowScrollPrompt] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollPrompt(window.scrollY <= window.innerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-[50vh] md:min-h-[40vh] flex flex-col items-center text-center p-6 text-gray-100">
      <motion.h1
        className="text-[70px] sm:text-[80px] md:text-[100px] font-bold leading-tight mt-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        Search Made <br />
        <span className="bg-gradient-to-r from-[#5973fa] via-[#de23e8] to-[#ff00f2] text-transparent bg-clip-text transition-all duration-200 hover:drop-shadow-xl">
          Simple
        </span>
      </motion.h1>

      <motion.p
        className="mt-4 text-xl sm:text-2xl max-w-2xl text-[#f5f5f5]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
      >
        Mimir helps you find the most relevant information effortlessly, using
        advanced AI-powered search and retrieval.
      </motion.p>

      <motion.button
        className="mt-14 px-6 py-4 bg-gray-100 text-black rounded-xl text-xl sm:text-2xl hover:bg-gray-300 transition"
        onClick={() => navigate("/login")}
      >
        Try Mimir
      </motion.button>

      {showScrollPrompt && <ScrollPrompt title={"Know More"} />}
    </div>
  );
};

export default GetStarted;
