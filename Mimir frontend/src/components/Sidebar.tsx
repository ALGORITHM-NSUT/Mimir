import React from 'react';
import { BiPlus, BiUser, BiSolidUserCircle } from 'react-icons/bi';

interface Props {
  uniqueTitles: string[];
  previousChats: string[];
  localUniqueTitles: string[];
  localChats: string[]
  backToHistoryPrompt: (uniqueTitle: string) => void;
  createNewChat: () => void;
}

const Sidebar: React.FC<Props> = ({ uniqueTitles, previousChats, localUniqueTitles, localChats, backToHistoryPrompt, createNewChat }) => {
  const handleNewChat = () => {
    createNewChat();
  };

  return (
    <section className="flex flex-col items-center justify-between w-72 p-4 bg-gray-800 text-white">
      <div className='flex justify-between text-center rounded-md w-full p-4 border-1 border-gray-400' onClick={handleNewChat} role='button'>
        <BiPlus size={20} />
        <button>New Chat</button>
      </div>
      <div className='sidebar-history'>
        {uniqueTitles.length > 0 && previousChats.length !== 0 && (
          <>
            <p>Ongoing</p>
            <ul>
              {uniqueTitles.map((uniqueTitle, idx) => (
                <li key={idx} onClick={() => backToHistoryPrompt(uniqueTitle)}>
                  {uniqueTitle}
                </li>
              ))}
            </ul>
          </>
        )}
        {localUniqueTitles.length > 0 && localChats.length !== 0 && (
          <>
            <p>Previous</p>
            <ul>
              {localUniqueTitles.map((uniqueTitle, idx) => (
                <li key={idx} onClick={() => backToHistoryPrompt(uniqueTitle)}>
                  {uniqueTitle}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className='sidebar-info w-full pt-4 border-t-1 border-gray-400'>
        <div className='sidebar-info-upgrade p-2 hover:bg-gray-500 rounded-md cursor-pointer'>
          <BiUser size={20} />
          <p>Upgrade plan</p>
        </div>
        <div className='sidebar-info-user p-2 hover:bg-gray-500 rounded-md cursor-pointer'>
          <BiSolidUserCircle size={20} />
          <p>User</p>
        </div>
      </div>
    </section>
  );
};

export default Sidebar;
