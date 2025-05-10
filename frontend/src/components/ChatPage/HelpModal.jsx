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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#1f1f1f] rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-gray-700"
        style={{
          maxHeight: '80vh',
          overflowY: 'auto',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none' // IE 10+
        }}
      >
        <style>
          {`
            /* Hide scrollbar for Chrome, Safari and Opera */
            div::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <FaQuestionCircle size={24} className="text-cyan-400" />
            <h2 className="text-2xl font-semibold text-white">Help & Information</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 text-sm text-gray-300">
          {/* Common Issues */}
          <Section title="Common Issues" color="amber-400" items={[
            'If responses seem irrelevant, try rephrasing your question.',
            'Network issues may cause interruptions - check your connection.',
            'Session timeouts may require you to log in again.'
          ]} />

          {/* Rate Limits */}
          <Section title="Rate Limits" color="red-400" items={[
            'Maximum 200 characters per query.',
            'Excessive usage may result in temporary throttling.'
          ]} />

          {/* Additional Info */}
          <Section title="Additional Information" color="purple-400" items={[
            'Mimir uses AI to retrieve information from university documents.',
            'Share your conversations using the share button in the header.',
            'All responses are verified with official sources.',
            <>
              For technical support, contact <span className="text-cyan-400">algorithmnsut@gmail.com</span>.
            </>
          ]} />
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors text-sm font-medium"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

const Section = ({ title, color, items }) => (
  <div>
    <h3 className={`text-base font-semibold text-${color} mb-2`}>{title}</h3>
    <ul className="bg-[#2a2a2a] rounded-lg p-4 list-disc pl-5 space-y-2">
      {items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  </div>
);

export default HelpModal;
