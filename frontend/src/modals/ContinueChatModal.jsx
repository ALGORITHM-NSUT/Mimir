import React from "react";

const ContinueChatModal = ({ isOpen, onClose, onContinue }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-black">
        <h2 className="text-lg font-semibold">Continue Chat</h2>
        <p className="mt-2">Do you want to continue this chat?</p>
        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 bg-gray-300 rounded-lg mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={onContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContinueChatModal;
