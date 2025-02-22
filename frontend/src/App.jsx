import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
import "./index.css";
import { UserContext, UserProvider } from "./Context/UserContext";
import SharedChatPage from "./pages/SharedChatPage";

const ProtectedRoute = ({ children }) => {
  const { userId } = useContext(UserContext);
  return userId ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/new" element={<ProtectedRoute><ChatPage key="newChat" /></ProtectedRoute>} />
          <Route path="/chat/:chatId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/chat/shared" element={<SharedChatPage />} />

        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
