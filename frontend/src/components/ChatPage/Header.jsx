import React from "react";
import { Link } from "react-router-dom";
import { TbLayoutSidebarLeftExpandFilled } from "react-icons/tb";
import { FaPencilAlt, FaUserCircle } from "react-icons/fa";
import ProfileMenu from "../Profile/ProfileMenu";

const Header = ({ toggleSidebar, setAlert }) => {


  const handleNewChatClick = (e) => {
    if (location.pathname === "/new") {
      e.preventDefault(); 
      setAlert({ type: "error", text: "Already on New Chat Page." });
    }
  };

  return (
    <header className="w-full text-white py-4 px-6 grid grid-cols-3 items-center shadow-md bg-[#1b1c1d]">
      {/* Left Section */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button onClick={toggleSidebar} className="text-white focus:outline-none">
          <TbLayoutSidebarLeftExpandFilled className="text-2xl sm:text-3xl" />
        </button>

        <Link to="/new" onClick={handleNewChatClick} className="sm:flex items-center hidden">
          <FaPencilAlt className="text-lg sm:text-xl" />
        </Link>
      </div>

      {/* Center - Title */}
      <span className="text-xl sm:text-2xl font-semibold bg-white text-transparent bg-clip-text text-center">
        Mimir
      </span>

      {/* Right Section - Profile Icon */}
      <ProfileMenu />
    </header>
  );
};

export default Header;
