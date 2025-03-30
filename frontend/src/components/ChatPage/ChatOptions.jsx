import { Menu } from "@headlessui/react";
import { FaTrash, FaEdit } from "react-icons/fa";
import { useState } from "react";
import RenameChatModal from "../../modals/RenameChatModal";
import ThreeDotsMenu from "./ThreeDotsMenu";

const ChatOptions = ({ userId, chatId, handleDeleteChat, setChats }) => {
  const [renameModalOpen, setRenameModalOpen] = useState(false);

  const menuItems = [
    {
      label: "Delete",
      icon: <FaTrash className="mr-2" />,
      action: () => handleDeleteChat(chatId),
    },
    {
      label: "Rename",
      icon: <FaEdit className="mr-2" />,
      action: () => setRenameModalOpen(true),
    },
  ];

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>

        <ThreeDotsMenu />
      </div>
      

      <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right bg-[#1b1c1d] border border-[#252627] rounded-lg shadow-lg focus:outline-none z-50">
        {menuItems.map(({ label, icon, action }, index) => (
          <Menu.Item key={index}>
            {({ active }) => (
              <button
                onClick={action}
                className={`${
                  active ? "bg-[#252627] text-white" : "text-gray-300"
                } flex w-full px-4 py-2 text-sm items-center transition`}
              >
                {icon}
                {label}
              </button>
            )}
          </Menu.Item>
        ))}
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
