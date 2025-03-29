// InputBox.jsx
import React, { useState, useRef, useEffect } from "react";
import { IoSend } from "react-icons/io5";
import { RiRobot2Line, RiSearchEyeLine ,RiSearchFill} from "react-icons/ri";
import { BsLightning, BsLightningCharge } from "react-icons/bs";
import { HiLightBulb } from "react-icons/hi";
import { MdTravelExplore } from "react-icons/md";
import SpeechButton from "./SpeechButton";
import { motion, AnimatePresence } from "framer-motion";
import DeepSearchModal from "./DeepSearchModal";

const MAX_CHAR_LIMIT = 150;

const InputBox = ({ onSendMessage, setAlert }) => {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDeepSearch, setIsDeepSearch] = useState(false);
  const textAreaRef = useRef(null);
  const [showDeepSearchModal, setShowDeepSearchModal] = useState(false);
  const [pendingDeepSearch, setPendingDeepSearch] = useState(false);

  useEffect(() => {
    if (textAreaRef.current && window.innerWidth > 768) {
      textAreaRef.current.focus();
    }
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, isDeepSearch);
      setMessage("");
      adjustTextAreaHeight();
    } else {
      setAlert({ type: "error", text: "Please enter your query." });
    }
  };

  const handleChange = (e) => {
    const newMessage = e.target.value;
    if (newMessage.length > MAX_CHAR_LIMIT) {
      setAlert({ 
        type: "warning", 
        text: `Character limit of ${MAX_CHAR_LIMIT} exceeded!` 
      });
      return;
    }
    setMessage(newMessage);
    adjustTextAreaHeight();
  };

  const adjustTextAreaHeight = () => {
    const textArea = textAreaRef.current;
    if (textArea) {
      textArea.style.height = "auto";
      textArea.style.height = Math.min(textArea.scrollHeight, 120) + "px";
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, rotate: 5 },
    tap: { scale: 0.95 }
  };

  const glowEffect = isFocused ? 
    'ring-1 ring-cyan-500/50 shadow-sm shadow-cyan-500/20' : 
    'hover:shadow-xs hover:shadow-cyan-500/10';

  const handleDeepSearchToggle = () => {
    if (!isDeepSearch) {
      setShowDeepSearchModal(true);
      setPendingDeepSearch(true);
    } else {
      setIsDeepSearch(false);
      setAlert({
        type: "info",
        text: "Switched to Quick Search mode"
      });
    }
  };

  const handleDeepSearchConfirm = () => {
    setShowDeepSearchModal(false);
    setIsDeepSearch(true);
    setPendingDeepSearch(false);
    setAlert({
      type: "info",
      text: "Switched to Deep Search mode - Responses may take longer but will be more comprehensive"
    });
  };

  const handleDeepSearchCancel = () => {
    setShowDeepSearchModal(false);
    setPendingDeepSearch(false);
    setIsDeepSearch(false);
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={containerVariants}
      transition={{ duration: 0.3 }}
      className={`relative flex items-center py-1 px-4 bg-[#303030]
        backdrop-blur-lg shadow-xl rounded-3xl w-full sm:w-[65%] overflow-hidden 
        transition-all duration-300 ${glowEffect}`}
      onClick={() => textAreaRef.current?.focus()}
    >
     

      <div className="relative flex-1">
        <textarea
          ref={textAreaRef}
          className="flex-1 p-3 pt-8 text-md sm:text-base outline-none 
            text-gray-100 bg-transparent placeholder-gray-400 rounded-lg 
            resize-none overflow-auto max-h-[150px] min-h-[40px] w-full 
            transition-all duration-200"
          placeholder="Ask anything..."
          value={message}
          maxLength={MAX_CHAR_LIMIT}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
        />
        
        {/* Character Counter */}
        <AnimatePresence>
          {message.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-2 right-2 flex items-center gap-1"
            >
              <div className="h-1 w-20 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#582EA6]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(message.length / MAX_CHAR_LIMIT) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">
                {message.length}/{MAX_CHAR_LIMIT}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <motion.button
          className={`p-3 text-gray-50 rounded-full 
            bg-[#404040] hover:bg-[#505050] transition-all
            ${isDeepSearch ? 
              'text-yellow-400 ring-1 ring-yellow-400/30 shadow-[0_0_10px_rgba(250,204,21,0.2)]' : 
              'text-gray-400'
            }
            hover:shadow-yellow-500/30 relative`}
          onClick={handleDeepSearchToggle}
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          title={isDeepSearch ? "Deep Search Mode" : "Quick Search Mode"}
        >
          <MdTravelExplore size={22} />
          {isDeepSearch && (
            <motion.div
              className="absolute inset-0 rounded-full bg-yellow-400/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.button>

        <motion.div
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
        >
          <SpeechButton 
            setMessage={setMessage} 
            isListening={isListening} 
            setIsListening={setIsListening} 
          />
        </motion.div>

        <motion.button
          className={`p-3 ml-2 text-gray-50 rounded-full transition-all shadow-md
            ${message.trim() ? 
              `${isDeepSearch ? 
                'bg-[#404040] hover:bg-[#505050]' : 
                ''
                
              }` : 
              'opacity-50 cursor-not-allowed bg-[#404040]'}`}
          onClick={handleSend}
          disabled={!message.trim()}
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
        >
          <motion.div
            animate={message.trim() ? { 
              rotate: [0, 360],
              scale: [1, 1.2, 1] 
            } : {}}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <IoSend size={22} />
          </motion.div>
        </motion.button>
      </div>

      {/* Character limit warning */}
      <AnimatePresence>
        {message.length > MAX_CHAR_LIMIT * 0.9 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute -top-8 right-0 text-xs text-[#582EA6]
              bg-[#1a1a2e] px-3 py-1 rounded-t-lg shadow-lg"
          >
            Approaching character limit
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add a small indicator for search mode */}
      <AnimatePresence>
        {message.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute -bottom-6 left-4 text-xs ${
              isDeepSearch ? 'text-yellow-400' : 'text-gray-400'
            }`}
          >
            {isDeepSearch ? 'Deep Search Mode' : 'Quick Search Mode'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deep Search Modal */}
      <AnimatePresence>
        {showDeepSearchModal && (
          <DeepSearchModal
            onConfirm={handleDeepSearchConfirm}
            onClose={handleDeepSearchCancel}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InputBox;