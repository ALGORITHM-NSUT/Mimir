import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const TitleUpdater = () => {
  const location = useLocation();
  const [title, setTitle] = useState("Mimir");

  useEffect(() => {
    const updateTitle = () => {
      let newTitle = "Mimir"; // Default title
      const match = location.pathname.match(/\/chat\/(.+)/);
      const chatId = match ? match[1] : null;

      if (chatId) {
        const userId = JSON.parse(sessionStorage.getItem("user"))?.userId;
        if (userId) {
          const chats = JSON.parse(sessionStorage.getItem(`chats_${userId}`) || "[]");
          const chat = chats.find((c) => c.chatId === chatId);
          if (chat) {
            newTitle = chat.title; // Set chat title from session storage
          }
        }
      }

      setTitle(newTitle);
      document.title = newTitle;
    };

    updateTitle(); // Run initially

    // Polling for sessionStorage changes every 500ms
    const intervalId = setInterval(updateTitle, 500);

    return () => clearInterval(intervalId);
  }, [location]);

  return null;
};

export default TitleUpdater;
