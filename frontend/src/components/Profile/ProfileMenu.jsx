// // import React, { useState, useRef, useEffect } from "react";
// // import { FaUserCircle, FaShareAlt, FaCog, FaSignOutAlt, FaTimes, FaCopy } from "react-icons/fa";
// // import axios from "axios";

// // const ProfileMenu = () => {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const [shareableLink, setShareableLink] = useState("");
// //   const menuRef = useRef(null);
// //   const modalRef = useRef(null);

// //   // Toggle menu visibility
// //   const toggleMenu = () => {
// //     setIsOpen(!isOpen);
// //   };

// //   // Close menu when clicking outside
// //   useEffect(() => {
// //     const handleClickOutside = (event) => {
// //       if (menuRef.current && !menuRef.current.contains(event.target)) {
// //         setIsOpen(false);
// //       }
// //     };

// //     document.addEventListener("mousedown", handleClickOutside);
// //     return () => document.removeEventListener("mousedown", handleClickOutside);
// //   }, []);

// //   // Handle "Share Chat" click
// //   const handleShareChat = async () => {
// //     console.log("Share Chat Clicked!"); // Debugging Log
// //     const currentUrl = window.location.href;
// //     const newUrl = `${currentUrl}?share=true`;

// //     try {
// //       // Make backend call to mark chat as shareable
// //       await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat/share`, { url: newUrl });

// //       setShareableLink(newUrl);
// //       setIsModalOpen(true); // Open modal
// //       console.log("Modal should open now!"); // Debugging Log
// //     } catch (error) {
// //       console.error("Error making chat shareable:", error);
// //     }
// //   };

// //   // Copy link to clipboard
// //   const copyToClipboard = () => {
// //     navigator.clipboard.writeText(shareableLink);
// //   };

// //   // Close modal when clicking outside
// //   useEffect(() => {
// //     const handleClickOutsideModal = (event) => {
// //       if (modalRef.current && !modalRef.current.contains(event.target)) {
// //         setIsModalOpen(false);
// //       }
// //     };

// //     if (isModalOpen) {
// //       document.addEventListener("mousedown", handleClickOutsideModal);
// //     }

// //     return () => document.removeEventListener("mousedown", handleClickOutsideModal);
// //   }, [isModalOpen]);

// //   return (
// //     <div className="relative">
// //       {/* Profile Icon */}
// //       <div className="flex justify-end">
// //         <FaUserCircle className="text-xl sm:text-2xl cursor-pointer" onClick={toggleMenu} />
// //       </div>

// //       {/* Dropdown Menu */}
// //       {isOpen && (
// //         <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] text-gray-100 rounded-xl shadow-lg z-50">
// //           <ul className="py-2">
// //             <li
// //               className="px-4 py-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer rounded-md mx-2 transition-all"
// //               onClick={handleShareChat}
// //             >
// //               <FaShareAlt className="text-lg" />
// //               Share Chat
// //             </li>
// //             <li className="px-4 py-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer rounded-md mx-2 transition-all">
// //               <FaCog className="text-lg" />
// //               Settings
// //             </li>
// //             <li className="px-4 py-2 flex items-center gap-2 hover:bg-red-500 cursor-pointer rounded-md mx-2 transition-all">
// //               <FaSignOutAlt className="text-lg" />
// //               Logout
// //             </li>
// //           </ul>
// //         </div>
// //       )}

// //       {/* Share Chat Modal */}
// //       {isModalOpen && (
// //         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
// //           <div ref={modalRef} className="bg-[#2a2a2a] text-gray-100 rounded-lg p-6 w-[90%] max-w-md shadow-lg">
// //             <div className="flex justify-between items-center mb-4">
// //               <h2 className="text-lg font-semibold">Share Chat</h2>
// //               <FaTimes className="cursor-pointer text-xl" onClick={() => setIsModalOpen(false)} />
// //             </div>
// //             <p className="text-sm text-gray-300 mb-4">Copy and share this link:</p>
// //             <div className="flex items-center bg-gray-800 p-2 rounded-md">
// //               <input
// //                 type="text"
// //                 value={shareableLink}
// //                 readOnly
// //                 className="w-full bg-transparent text-gray-300 outline-none"
// //               />
// //               <FaCopy className="text-gray-400 cursor-pointer hover:text-white ml-2" onClick={copyToClipboard} />
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default ProfileMenu;

// import React, { useState, useRef, useEffect } from "react";
// import { FaUserCircle, FaShareAlt, FaCog, FaSignOutAlt, FaTimes, FaCopy } from "react-icons/fa";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Switch } from "@/components/ui/switch";
// import { useTheme } from "@/components/theme-provider"; 
// import axios from "axios";

// const ProfileMenu = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isShareModalOpen, setIsShareModalOpen] = useState(false);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
//   const [shareableLink, setShareableLink] = useState("");
//   const [formData, setFormData] = useState({ name: "", branch: "", rollNo: "" });
//   const { theme, setTheme } = useTheme();
//   const menuRef = useRef(null);

//   // Toggle menu visibility
//   const toggleMenu = () => setIsOpen(!isOpen);

//   // Close menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Handle "Share Chat" click
//   const handleShareChat = async () => {
//     const currentUrl = window.location.href;
//     const newUrl = `${currentUrl}?share=true`;
//     try {
//       await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat/share`, { url: newUrl });
//       setShareableLink(newUrl);
//       setIsShareModalOpen(true);
//     } catch (error) {
//       console.error("Error making chat shareable:", error);
//     }
//   };

//   // Copy link to clipboard
//   const copyToClipboard = () => navigator.clipboard.writeText(shareableLink);

//   // Handle profile input change
//   const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

//   return (
//     <div className="relative">
//       {/* Profile Icon */}
//       <div className="flex justify-end">
//         <FaUserCircle className="text-xl sm:text-2xl cursor-pointer" onClick={toggleMenu} />
//       </div>

//       {/* Dropdown Menu */}
//       {isOpen && (
//         <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] text-gray-100 rounded-xl shadow-lg z-50">
//           <ul className="py-2">
//             <li className="px-4 py-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer rounded-md mx-2 transition-all"
//                 onClick={handleShareChat}>
//               <FaShareAlt className="text-lg" />
//               Share Chat
//             </li>
//             <li className="px-4 py-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer rounded-md mx-2 transition-all"
//                 onClick={() => setIsSettingsOpen(true)}>
//               <FaCog className="text-lg" />
//               Settings
//             </li>
//             <li className="px-4 py-2 flex items-center gap-2 hover:bg-red-500 cursor-pointer rounded-md mx-2 transition-all"
//                 onClick={() => setIsLogoutConfirmOpen(true)}>
//               <FaSignOutAlt className="text-lg" />
//               Logout
//             </li>
//           </ul>
//         </div>
//       )}

//       {/* Share Chat Modal */}
//       <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
//         <DialogContent className="p-6 rounded-xl bg-[#2a2a2a] text-gray-100">
//           <DialogHeader>
//             <DialogTitle className="text-lg font-semibold">Share Chat</DialogTitle>
//           </DialogHeader>
//           <p className="text-sm text-gray-300 mb-4">Copy and share this link:</p>
//           <div className="flex items-center bg-gray-800 p-2 rounded-md">
//             <Input type="text" value={shareableLink} readOnly className="w-full bg-transparent text-gray-300" />
//             <FaCopy className="text-gray-400 cursor-pointer hover:text-white ml-2" onClick={copyToClipboard} />
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Settings Modal */}
//       <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
//         <DialogContent className="p-6 rounded-xl bg-white dark:bg-gray-900">
//           <DialogHeader>
//             <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <Input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} />
//             <Input name="branch" placeholder="Branch" value={formData.branch} onChange={handleInputChange} />
//             <Input name="rollNo" placeholder="Roll No" value={formData.rollNo} onChange={handleInputChange} />
//           </div>
//           <div className="flex items-center justify-between mt-4">
//             <span className="text-sm">Dark Mode</span>
//             <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
//             <Button onClick={() => console.log("Profile Updated:", formData)}>Save Changes</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Logout Confirmation Modal */}
//       <Dialog open={isLogoutConfirmOpen} onOpenChange={setIsLogoutConfirmOpen}>
//         <DialogContent className="p-6 rounded-xl bg-white dark:bg-gray-900">
//           <DialogHeader>
//             <DialogTitle className="text-xl font-semibold">Confirm Logout</DialogTitle>
//           </DialogHeader>
//           <p className="text-gray-500 dark:text-gray-400">Are you sure you want to log out?</p>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setIsLogoutConfirmOpen(false)}>Cancel</Button>
//             <Button variant="destructive" onClick={() => console.log("User logged out")}>Logout</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default ProfileMenu;


import React, { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaShareAlt, FaCog, FaSignOutAlt } from "react-icons/fa";
import ShareChatModal from "./ShareChatModal";
import SettingsModal from "./SettingsModal";
import LogoutConfirmModal from "./LogoutConfirmModal";

const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);

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
        <FaUserCircle className="text-xl sm:text-2xl cursor-pointer" onClick={toggleMenu} />
      </div>

      {isOpen && (
        <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-[#2a2a2a] text-gray-100 rounded-xl shadow-lg z-50">
          <ul className="py-2">
            <li className="px-4 py-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer rounded-md mx-2 transition-all"
                onClick={() => setIsShareModalOpen(true)}>
              <FaShareAlt className="text-lg" /> Share Chat
            </li>
            <li className="px-4 py-2 flex items-center gap-2 hover:bg-gray-700 cursor-pointer rounded-md mx-2 transition-all"
                onClick={() => setIsSettingsOpen(true)}>
              <FaCog className="text-lg" /> Settings
            </li>
            <li className="px-4 py-2 flex items-center gap-2 hover:bg-red-500 cursor-pointer rounded-md mx-2 transition-all"
                onClick={() => setIsLogoutConfirmOpen(true)}>
              <FaSignOutAlt className="text-lg" /> Logout
            </li>
          </ul>
        </div>
      )}

      <ShareChatModal open={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
      <SettingsModal open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <LogoutConfirmModal open={isLogoutConfirmOpen} onClose={() => setIsLogoutConfirmOpen(false)} />
    </div>
  );
};

export default ProfileMenu;
