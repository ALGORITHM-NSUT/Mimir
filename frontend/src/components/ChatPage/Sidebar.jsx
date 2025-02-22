import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";  // Added useLocation
import axios from "axios";
import { IoChatboxOutline } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";
import { TbLayoutSidebarRightExpandFilled } from "react-icons/tb";
import { UserContext } from "../../Context/UserContext.jsx";

const Sidebar = ({ isOpen, toggleSidebar, sidebarRef }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { chatId } = useParams();  // Get chat ID from URL
  const [chats, setChats] = useState([]);
  const { userId } = useContext(UserContext);

  useEffect(() => {
    console.log("Path changed:", location.pathname); // Debugging log
    if (userId) {
      fetchChats();
    }
  }, [chatId, userId]);  // Now triggers when user switches chats

  const fetchChats = async () => {
    try {
      setChats([]); // Clear previous state before fetching
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/chats?userId=${userId}`);
      setChats(response.data.chats);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };
  return (
    <aside
      className={`fixed left-0 top-0 w-64 h-full bg-transparent backdrop-blur-3xl text-white transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 z-50`}
      ref={sidebarRef}
    >
      <div className="p-4 flex flex-col gap-4">
        {/* Header with Close Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-semibold">Chats</h2>
          <button onClick={toggleSidebar} className="text-white hover:text-gray-400">
            <TbLayoutSidebarRightExpandFilled className="text-3xl" />
          </button>
        </div>

        {/* New Chat Button */}
        <Link to="/new" className="flex items-center gap-2 p-3 bg-[#333] hover:bg-[#444] rounded-3xl">
          <FaPlus />
          <span>New Chat</span>
        </Link>

        {/* Previous Chats List */}
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Previous Chats</h2>
          <ul className="space-y-2">
            {chats.slice().reverse().map((chat) => (
              <li key={chat.chatId}>
                <button
                  onClick={() => navigate(`/chat/${chat.chatId}`)}
                  className="flex items-center gap-2 p-2 w-full hover:bg-[#333] hover:rounded-3xl"
                >
                  <IoChatboxOutline />
                  <span>{chat.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
