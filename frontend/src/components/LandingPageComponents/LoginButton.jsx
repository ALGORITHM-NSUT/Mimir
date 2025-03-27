import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../Context/UserContext";

const LoginButton = () => {
  const { setUser } = useContext(UserContext);


  const handleCredentialResponse = async (response) => {
    const credential = response.credential;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important for sending cookies
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();


      if (res.ok) {
        setUser(data.user)
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
        auto_select: true,
        itp_support: true,
        setCookie: true
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        { theme: "outline", size: "large" }
      );
    } else {
      console.error("Google Sign-In script not loaded");
    }
  }, []);

  return <div id="google-signin-btn"></div>;
};

export default LoginButton;
