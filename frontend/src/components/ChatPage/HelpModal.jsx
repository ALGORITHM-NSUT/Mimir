import React from 'react';
import { motion } from 'framer-motion';
import { FaQuestionCircle, FaTimes } from 'react-icons/fa';
import { createPortal } from 'react-dom';

const HelpModal = ({ onClose }) => {
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
        className="bg-[#303030] rounded-xl p-6 max-w-2xl w-full shadow-xl border border-gray-700 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaQuestionCircle size={24} className="text-cyan-400" />
            <h2 className="text-xl font-semibold text-gray-100">Help & Information</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="space-y-6 text-gray-300">
          {/* Usage Instructions
          <div>
            <h3 className="text-lg font-medium text-cyan-400 mb-2">Usage Instructions</h3>
            <div className="bg-[#404040] rounded-lg p-4">
              <ul className="list-disc pl-5 space-y-2">
                <li>Type your query in the input box and press Enter or click the send button.</li>
                <li>Toggle between Quick Search and Deep Search modes using the explore icon.</li>
                <li>Use voice input by clicking the microphone icon.</li>
                <li>Access previous conversations from the sidebar.</li>
                <li>Share your conversations using the share button in the header.</li>
              </ul>
            </div>
          </div> */}

          {/* Common Failures */}
          <div>
            <h3 className="text-lg font-medium text-amber-400 mb-2">Common Issues</h3>
            <div className="bg-[#404040] rounded-lg p-4">
              <ul className="list-disc pl-5 space-y-2">
                <li>If responses seem irrelevant, try rephrasing your question.</li>
                <li>Deep Search mode may time out for complex queries - try breaking them down.</li>
                <li>Network issues may cause interruptions - check your connection if responses fail.</li>
                <li>Session timeouts may require you to log in again.</li>
              </ul>
            </div>
          </div>

          {/* Rate Limits */}
          <div>
            <h3 className="text-lg font-medium text-red-400 mb-2">Rate Limits</h3>
            <div className="bg-[#404040] rounded-lg p-4">
              <ul className="list-disc pl-5 space-y-2">
                <li>Maximum 150 characters per query.</li>
                <li>Deep Search is limited to 1 requests per minute.</li>
                <li>Quick Search has a limit of 2 requests per minute.</li>
                <li>Excessive usage may result in temporary throttling.</li>
              </ul>
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <h3 className="text-lg font-medium text-purple-400 mb-2">Additional Information</h3>
            <div className="bg-[#404040] rounded-lg p-4">
              <ul className="list-disc pl-5 space-y-2">
                <li>Mimir uses AI to retrieve information from university documents.</li>
                <li>Share your conversations using the share button in the header.</li>
                <li>All responses should be verified with official sources.</li>
               
                <li>For technical support, contact <span className="text-cyan-400">algorithmnsut@gmail.com</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 text-white
              hover:bg-cyan-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default HelpModal; 