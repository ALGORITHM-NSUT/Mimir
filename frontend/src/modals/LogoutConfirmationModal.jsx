import React from "react";
import { motion } from 'framer-motion';
import { FaSignOutAlt } from "react-icons/fa";
import { createPortal } from 'react-dom';

const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] 
        flex items-center justify-center p-4"
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#303030] rounded-xl p-6 max-w-md w-full shadow-xl
          border border-gray-700"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <FaSignOutAlt size={24} className="text-red-400" />
          <h2 className="text-xl font-semibold text-gray-100">Confirm Logout</h2>
        </div>

        <p className="text-gray-300 mb-6">
          Are you sure you want to log out? You will need to sign in again to access your chats.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700
              transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white
              hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default LogoutConfirmationModal;
