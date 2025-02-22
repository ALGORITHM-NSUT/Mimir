import { createContext, useState, useEffect } from "react";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "Ram");

  const login = (id) => {
    localStorage.setItem("userId", id);
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem("userId");
    setUserId(null);
  };

  return (
    <UserContext.Provider value={{ userId, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
