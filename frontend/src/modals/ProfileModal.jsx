import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ProfileModal = ({ user, isOpen, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        >
          <div
            ref={modalRef}
            className="bg-[#1b1c1d] text-white p-6 md:p-8 rounded-xl shadow-2xl w-80 md:w-96 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-xl focus:outline-none"
              aria-label="Close"
            >
              <FaTimes />
            </button>

            <div className="flex flex-col items-center">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-full border-2 border-gray-500 shadow-md"
                />
              ) : (
                <FaUserCircle className="w-24 h-24 text-gray-500" />
              )}
              <h2 className="text-xl font-semibold mt-4">{user?.name}</h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.getElementById("portal-root") || document.body
  );
};

export default ProfileModal;