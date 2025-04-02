import React, { useState, useRef, useEffect, useContext } from "react";
import { FaUserCircle, FaSignOutAlt, FaUser } from "react-icons/fa";
import { RiFeedbackFill } from "react-icons/ri";
import { useParams } from "react-router-dom";
import { UserContext } from "../../context/UserContext.jsx";
import Alert from "@mui/material/Alert";
import LogoutConfirmationModal from "../../modals/LogoutConfirmationModal.jsx";
import ProfileModal from "../../modals/ProfileModal.jsx";
import FeedbackModal from "../../modals/FeedbackModal.jsx";

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const menuRef = useRef(null);
  const { chatId } = useParams();
  const { user, logoutUser } = useContext(UserContext);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const toggleProfileModal = () => setIsProfileOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="flex justify-end">
        {user?.picture ? (
          <img
            src={user.picture}
            alt="User Profile"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full cursor-pointer"
            onClick={toggleMenu}
            referrerPolicy="no-referrer"
          />
        ) : (
          <FaUserCircle className="text-xl sm:text-2xl cursor-pointer" onClick={toggleMenu} />
        )}
      </div>

      {isOpen && (
        <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] text-gray-100 rounded-xl shadow-lg z-50">
          <ul className="py-2">
            <li
              className="px-4 py-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer rounded-md mx-2 transition-all"
              onClick={toggleProfileModal}
            >
              <FaUser className="text-lg" />
              Profile
            </li>
            <li
              className="px-4 py-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer rounded-md mx-2 transition-all"
              onClick={() => setIsFeedbackModalOpen(true)}
            >
              <RiFeedbackFill className="text-lg" />
              Feedback
            </li>
            <li
              className="px-4 py-2 mt-1 flex items-center gap-2 hover:bg-red-500 cursor-pointer rounded-md mx-2 transition-all"
              onClick={() => setIsLogoutModalOpen(true)}
            >
              <FaSignOutAlt className="text-lg" />
              Logout
            </li>
          </ul>
        </div>
      )}

      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-96 z-50">
          <Alert severity={alertMessage.type}>{alertMessage.text}</Alert>
        </div>
      )}

      <LogoutConfirmationModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={logoutUser} />
      <ProfileModal user={user} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} />
    </div>
  );
};

export default ProfileMenu;