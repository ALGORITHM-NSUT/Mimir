import { useEffect, useState } from "react";
import axios from "axios";

const useChatPolling = (chatId) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    let intervalId, timeoutId;

    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/chat/${chatId}?userId=${userId}`
        );
        setChatHistory(response.data.chatHistory || []);
      } catch (error) {
        setIsPolling(false); // Stop polling on error
      }
    };

    if (chatId && isPolling) {
      fetchChatHistory(); // Immediate fetch on page load
      intervalId = setInterval(fetchChatHistory, 3000);

      timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        setIsPolling(false);
        setTimeout(() => setIsPolling(true), 3000); // Restart after 3s
      }, 30000);
    }

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [chatId, isPolling]);

  return chatHistory;
};

export default useChatPolling;
