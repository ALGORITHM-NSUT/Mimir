import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { UserContext, UserProvider } from "./Context/UserContext";
import { ThemeProvider } from "./Context/ThemeContext";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
import SharedChatPage from "./pages/SharedChatPage";
import "./index.css";
import LoginPage from "./pages/LoginPage";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);
  return user?.userId ? children : <Navigate to="/" />;
};

const App = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <AppRoutes />
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
};

const AppRoutes = () => {

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/new" element={<ProtectedRoute><ChatPage key="newChat" /></ProtectedRoute>} />
      <Route path="/chat/:chatId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/chat/shared" element={<SharedChatPage />} />
    </Routes>
  );
};

export default App;
