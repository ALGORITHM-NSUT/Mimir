import React from 'react';
import { motion } from 'framer-motion';
import { RiSearchEyeLine } from 'react-icons/ri';
import { createPortal } from 'react-dom';

const DeepSearchModal = ({ onConfirm, onClose }) => {
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
        {/* Rest of the modal content remains the same */}
        <div className="flex items-center gap-3 mb-4">
          <RiSearchEyeLine size={24} className="text-cyan-400" />
          <h2 className="text-xl font-semibold text-gray-100">Deep Search (Experimental)</h2>
        </div>

        <p className="text-gray-300 mb-4">
          This option performs a more comprehensive search using an advanced model,
          which may yield different or more in-depth results. Please be aware that Deep Search can take significantly longer,
          potentially up to 1 minute, to complete.
        </p>
        
        <div className="bg-[#404040] rounded-lg p-4 mb-6">
          <p className="text-amber-400 text-sm mb-2">
            
          </p>
          <p className="text-red-400 text-smpt-2">
            ⚠️ Warning: This is an experimental feature and may produce errors or unexpected results.
          </p>
        </div>

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
            className="px-4 py-2 rounded-lg bg-cyan-600 text-white
              hover:bg-cyan-700 transition-colors"
          >
            Proceed with Deep Search
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default DeepSearchModal;