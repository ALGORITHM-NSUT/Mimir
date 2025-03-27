import React from "react";

const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#2a2a2a] text-gray-100 rounded-lg p-6 w-[90%] max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
        <p className="text-sm text-gray-300 mb-4">Are you sure you want to log out?</p>
        <div className="flex justify-end gap-3">
          <button className="bg-gray-600 px-4 py-2 rounded-md" onClick={onClose}>Cancel</button>
          <button className="bg-red-500 px-4 py-2 rounded-md" onClick={onConfirm}>Logout</button>
        </div>
      </div>
    </div>
  ) : null;
};

export default LogoutConfirmationModal;
