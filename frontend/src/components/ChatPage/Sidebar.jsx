import React from "react";
import { TbLayoutSidebarRightExpandFilled } from "react-icons/tb";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div
    className={`fixed top-0 left-0 h-full w-64 bg-transparent backdrop-blur-3xl text-white p-4 transition-transform duration-500 z-50 transform shadow-lg ${
      isOpen ? "translate-x-0 shadow-[10px_0px_20px_rgba(255,255,255,0.01)]" : "-translate-x-full shadow-none"
    }`}
    >
      {/* Close Button */}
      {isOpen && (
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
        >
          <TbLayoutSidebarRightExpandFilled className="text-white text-2xl" />
        </button>
      )}

      {/* Sidebar Content */}
      {isOpen && (
        <nav className="mt-20">
          <ul className="space-y-3">
            <li className="hover:bg-gray-700 p-2 rounded">New Chat</li>
            <li className="hover:bg-gray-700 p-2 rounded">Saved Chats</li>
            <li className="hover:bg-gray-700 p-2 rounded">Settings</li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Sidebar;
