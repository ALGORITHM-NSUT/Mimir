import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import './index.css';
import { ThemeProvider } from './Context/ThemeContext'; // Ensure correct casing

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/new" element={<ChatPage key="newChat" />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
