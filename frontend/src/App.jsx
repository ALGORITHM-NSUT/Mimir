import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
import "./index.css";
import { UserContext, UserProvider } from "./Context/UserContext";
import SharedChatPage from "./pages/SharedChatPage";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);
  return user?.userId ? children : <Navigate to="/" />;
};

axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";


const App = () => {
  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
};

const AppRoutes = () => {
  const { user } = useContext(UserContext);

  return (
    <Routes>
      <Route path="/" element={user?.userId ? <Navigate to="/new" /> : <LandingPage />} />
      <Route path="/new" element={<ProtectedRoute><ChatPage key="newChat" /></ProtectedRoute>} />
      <Route path="/chat/:chatId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/chat/shared" element={<SharedChatPage />} />
    </Routes>
  );
};

export default App;
