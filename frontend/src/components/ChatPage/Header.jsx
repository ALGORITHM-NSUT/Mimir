import React from "react";
import { TbLayoutSidebarLeftExpandFilled } from "react-icons/tb";
import { FaUserCircle } from "react-icons/fa";

const Header = ({ toggleSidebar }) => {
  return (
    <header className="w-full bg-gray-800 text-white py-4 px-6 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-4">
        {/* Sidebar Toggle Button */}
        <button onClick={toggleSidebar}>
          <TbLayoutSidebarLeftExpandFilled className="text-2xl text-white cursor-pointer" />
        </button>

        {/* Mimir Logo */}
        <img src="Mimir_logo.png" alt="Mimir Logo" className="h-8" />
      </div>

      {/* User Icon */}
      <FaUserCircle className="text-2xl cursor-pointer" />
    </header>
  );
};

export default Header;
