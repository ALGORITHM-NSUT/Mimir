import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { UserContext, UserProvider } from "./Context/UserContext";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
import SharedChatPage from "./pages/SharedChatPage";
import "./index.css";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);
  return user?.userId ? children : <Navigate to="/" />;
};

// Component to update document title dynamically
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

const App = () => {
  return (
    <UserProvider>
      <Router>
        <TitleUpdater />
        <AppRoutes />
      </Router>
    </UserProvider>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LandingPage />} />
      <Route path="/new" element={<ProtectedRoute><ChatPage key="newChat" /></ProtectedRoute>} />
      <Route path="/chat/:chatId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/chat/shared" element={<SharedChatPage />} />
    </Routes>
  );
};

export default App;
