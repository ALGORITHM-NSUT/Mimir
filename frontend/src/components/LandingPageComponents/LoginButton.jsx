import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

const LoginButton = ({ navigateUrl = "new"}) => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate()


  const handleCredentialResponse = async (response) => {
    const credential = response.credential;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();


      if (res.ok) {
        setUser(data.user)
        sessionStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => navigate(`/${navigateUrl}`, { state: { isContinueModalOpen: true } }), 300);
      } else {
        console.error("Login failed:", data.detail);
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false
      });

     google.accounts.id.renderButton(
  document.getElementById("google-signin-btn"),
  {
    type: "standard",
    theme: "filled_blue", 
    size: "extra large", 
    shape: "pill", 
    
  }
);
    } else {
      console.error("Google Sign-In script not loaded");
    }
  }, []);
  

  return <div className="align-center" id="google-signin-btn"></div>;
};

export default LoginButton;
