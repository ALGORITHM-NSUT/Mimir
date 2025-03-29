import { Menu } from "@headlessui/react";
import { FaEllipsisH, FaTrash, FaShare, FaEdit } from "react-icons/fa";
import RenameChatModal from "../../modals/RenameChatModal";
import { useState } from "react";

const ChatOptions = ({ userId, chatId, handleDeleteChat, setChats }) => {
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="p-2 rounded-full hover:bg-[#252627] transition">
        <FaEllipsisH className="text-gray-400 hover:text-white" />
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-40 bg-[#1b1c1d] border border-[#252627] rounded-lg shadow-lg focus:outline-none z-50">
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => handleDeleteChat(chatId)}
              className={`${
                active ? "bg-[#252627] text-white" : "text-gray-300"
              } flex w-full px-4 py-2 text-sm items-center transition`}
            >
              <FaTrash className="mr-2" />
              Delete
            </button>
          )}
        </Menu.Item>
        <Menu.Item>
        {({ active }) => (
          <button
            onClick={() => setRenameModalOpen(true)} // Open modal
            className={`${
              active ? "bg-[#252627] text-white" : "text-gray-300"
            } flex w-full px-4 py-2 text-sm items-center transition`}
          >
            <FaEdit className="mr-2" />
            Rename
          </button>
        )}
      </Menu.Item>
      </Menu.Items>
      <RenameChatModal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        chatId={chatId}
        userId={userId}
        setChats={setChats} 
      />
    </Menu>
  );
};

export default ChatOptions;
