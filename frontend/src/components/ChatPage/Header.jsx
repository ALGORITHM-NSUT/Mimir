import React from "react";
import { Link } from "react-router-dom";
import { TbLayoutSidebarLeftExpandFilled } from "react-icons/tb";
import { FaPencilAlt, FaUserCircle } from "react-icons/fa";

const Header = ({ toggleSidebar }) => {
  return (
    <header className="w-full text-white py-4 px-6 flex items-center justify-between shadow-md bg-[#1b1c1d]">
      {/* Left Section */}
      <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
        <button onClick={toggleSidebar} className="text-white focus:outline-none">
          <TbLayoutSidebarLeftExpandFilled className="text-2xl sm:text-3xl" />
        </button>

        <Link to="/new" className="flex items-center">
          <FaPencilAlt className="text-lg sm:text-xl" />
        </Link>

        <span className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-violet-400 via-blue-400 to-pink-400 text-transparent bg-clip-text ml-auto">
          Mimir
        </span>
      </div>

      {/* Right Section - Profile Icon */}
      <FaUserCircle className="text-xl sm:text-2xl cursor-pointer flex-shrink-0 ml-3 sm:ml-5" />
    </header>
  );
};

export default Header;
