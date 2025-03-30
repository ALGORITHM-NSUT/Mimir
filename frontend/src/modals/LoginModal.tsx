import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardContent } from "@mui/material";
import { TfiClose } from "react-icons/tfi";
import LoginButton from "../components/LandingPageComponents/LoginButton";

const ModalWrapper = ({ children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="relative bg-[#1b1c1d] text-white p-6 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
      >
        <TfiClose size={20} />
      </button>
      {children}
    </motion.div>
  </motion.div>
);

const TermsModal = ({ onClose }) => (
  <ModalWrapper onClose={onClose}>
    <CardContent className="space-y-4 text-left">
      <h2 className="text-2xl font-bold">Terms and Services</h2>
      <div className="space-y-3 text-gray-300 text-sm overflow-auto max-h-[60vh]">
        {[
          { title: "Introduction", text: "Our RAG-based application uses an LLM to provide answers based on publicly available NSIT notices and circulars." },
          { title: "User Accounts", text: "Users sign in via Google. Your account information is securely stored and not shared with third parties." },
          { title: "Privacy Policy", text: "Chats are stored to improve response quality. We do not share data externally." },
          { title: "Content and Conduct", text: "Our system retrieves relevant data and does not modify official NSIT notices." },
          { title: "Termination", text: "Misuse of the system may result in restricted access." },
          { title: "Limitation of Liability", text: "We do not guarantee accuracy or completeness of responses." },
          { title: "Changes to Terms", text: "We may update these terms periodically. Continued use implies agreement." }
        ].map((section, index) => (
          <div key={index}>
            <h3 className="text-lg font-semibold text-white">{index + 1}. {section.title}</h3>
            <p>{section.text}</p>
          </div>
        ))}
      </div>
      <button
        onClick={onClose}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
      >
        I Understand
      </button>
    </CardContent>
  </ModalWrapper>
);

const AuthModal = ({ isOpen, onClose, title = "Welcome To Mimir" }) => {
  const [showTerms, setShowTerms] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalWrapper onClose={onClose}>
          {showTerms ? (
            <TermsModal onClose={() => setShowTerms(false)} />
          ) : (
            <CardContent className="flex flex-col items-start space-y-4 text-left">
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-gray-400 text-sm">
                By continuing, you agree to our{" "}
                <button
                  onClick={() => setShowTerms(true)}
                  className="text-blue-500 hover:underline"
                >
                  Terms and Services
                </button>.
              </p>
              <LoginButton />
            </CardContent>
          )}
        </ModalWrapper>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
