import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { IoChatboxOutline } from "react-icons/io5";
import { FaPlus, FaTrash } from "react-icons/fa";
import { TbLayoutSidebarRightExpandFilled } from "react-icons/tb";
import { UserContext } from "../../Context/UserContext.jsx";
import ChatOptions from "./ChatOptions.jsx";


const Sidebar = ({ isOpen, toggleSidebar, sidebarRef, setAlert }) => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const [chats, setChats] = useState([])

  const userId = user?.userId;

  const navigateToChat = (chatId) => {
    navigate(`/chat/${chatId}`); 
  };


  useEffect(() => {
    if (userId) {
      loadChats();
    }
  }, []);

  const loadChats = async () => {
    const cachedChats = sessionStorage.getItem(`chats_${userId}`);

    if (cachedChats) {
      setChats(JSON.parse(cachedChats));
    }

    fetchChats();
  };


  const fetchChats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/all?userId=${userId}`
      );

      const newChats = response.data.chats;

      const cachedChats = sessionStorage.getItem(`chats_${userId}`);
      const parsedChats = cachedChats ? JSON.parse(cachedChats) : [];

      if (JSON.stringify(newChats) !== JSON.stringify(parsedChats)) {
        sessionStorage.setItem(`chats_${userId}`, JSON.stringify(newChats));
        setChats(newChats);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };


  const handleDeleteChat = async (chatId) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        const response = await axios.post( `${import.meta.env.VITE_BACKEND_URL}/api/chat/del/${chatId}`, 
          { userId }, 
          { headers: { "Content-Type": "application/json" } }
        );
  
        if (response.status === 200) {
          console.log("Chat deleted successfully");
  
          // Remove from session storage
          const storedChats = JSON.parse(sessionStorage.getItem(`chats_${userId}`)) || [];
          const updatedChats = storedChats.filter((chat) => chat.chatId !== chatId);
          sessionStorage.setItem("chats", JSON.stringify(updatedChats));
  
          // Update state
          setChats(updatedChats);
        } else {
          console.error("Failed to delete chat");
          alert("Failed to delete chat. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting chat:", error);
        alert("An error occurred while deleting the chat. Please try again.");
      }
    }
  };

  const handleNewChatClick = (e) => {
    if (location.pathname === "/new") {
      e.preventDefault(); 
      setAlert({ type: "error", text: "Already on New Chat Page." });
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
        <Link
          to="/new"
          onClick={handleNewChatClick}
          className="flex items-center gap-2 p-3 bg-[#333] hover:bg-[#444] rounded-3xl"
        >
          <FaPlus />
          <span>New Chat</span>
        </Link>

        {/* Previous Chats List */}
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Previous Chats</h2>
          <ul className="space-y-2 overflow-y-scroll h-[60vh]">
            {chats?.slice().reverse().map((chat) => (
              <li key={chat.chatId} className="w-full flex">
                <button
                  onClick={() => navigateToChat(chat.chatId)}
                  className={`flex items-center gap-2 p-2 w-[80%] transition-all duration-300 ease-in-out ${chat.chatId == chatId ? "bg-[#555] text-white rounded-3xl" : "hover:bg-[#333] hover:rounded-3xl"}`}
                >
                  <IoChatboxOutline />
                  <span className="truncate w-[200px] text-left ">
                    {chat.title}
                  </span>
                </button>

                <ChatOptions chatId={chat.chatId} userId = {userId} handleDeleteChat={handleDeleteChat} setChats={setChats} />

              </li>
            ))}
          </ul>
        </div>
      </div>
      
    </aside>
  );
};

export default Sidebar;
