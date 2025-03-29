import React from "react";
import { FaTimes } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";

const ProfileModal = ({ user, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1b1c1d] text-white p-6 md:p-8 rounded-xl shadow-2xl w-80 md:w-96 relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-xl focus:outline-none"
          aria-label="Close"
        >
          <FaTimes />
        </button>

        {/* Profile Image */}
        <div className="flex flex-col items-center">
          <img
            src={user?.profileImage || ""}
            alt="Profile"
            className={`w-24 h-24 rounded-full border-2 border-gray-500 shadow-md ${
              user?.profileImage ? "" : "hidden"
            }`}
          />

          {/* Fallback Icon */}
          {!user?.profileImage && <FaUserCircle className="w-24 h-24 text-gray-500" />}
          <h2 className="text-xl font-semibold mt-4">{user?.name}</h2>
          <p className="text-gray-400">{user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
