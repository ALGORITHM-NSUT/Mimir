import React, { useState } from 'react'
import './App.css'
import SplitScreenChat from './components/SplitScreenChat'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import { backToHistoryPrompt } from './components/utils/backToHistoryPrompt'
import { createNewChat } from './components/utils/createNewChat'

function App() {
  const [text, setText] = useState(''); // text in prompt box
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState([]); // Sidebar
  const [localChats, setLocalChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [errorText, setErrorText] = useState('ERROR TEST'); // Error displayed above the prompt box
  const [isShowSidebar, setIsShowSidebar] = useState(true);

  const uniqueTitles = Array.from(
    new Set(previousChats.map((prevChat) => prevChat).reverse())
  );

  const localUniqueTitles = Array.from(
    new Set(localChats.map((prevChat) => prevChat).reverse())
  ).filter((title) => !uniqueTitles.includes(title));

  return (
    <>
      {/* <Navbar /> */}
      <div className='flex '>

        <Sidebar
          uniqueTitles={uniqueTitles}
          previousChats={previousChats}
          localUniqueTitles={localUniqueTitles}
          localChats={localChats}
          backToHistoryPrompt={backToHistoryPrompt}
          createNewChat={createNewChat}
        />
        <SplitScreenChat />
      </div>
      {/* <Footer /> */}
    </>
  )
}

export default App