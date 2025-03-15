import React, { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { UserContext } from "../Context/UserContext"; // Import UserContext
import Navbar from "../components/LandingPageComponents/Navbar";
import GetStarted from "../components/LandingPageComponents/GetStarted";
import Features from "../components/LandingPageComponents/Features";
import FAQ from "../components/LandingPageComponents/FAQ";
import Footer from "../components/LandingPageComponents/Footer";

const LandingPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const faqRef = useRef(null);
  const getStartedRef = useRef(null);
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      navigate("/new", { replace: true });
    }
  }, [user, navigate]); 

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsNavbarVisible(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative bg-[#faf9f5]">
      <Navbar scrollToSection={scrollToSection} featuresRef={featuresRef} faqRef={faqRef} getStartedRef={getStartedRef} isVisible={isNavbarVisible} />

      <section ref={getStartedRef}>
        <GetStarted />
      </section>

      <section ref={featuresRef}>
        <Features />
      </section>

      <section ref={faqRef}>
        <FAQ />
      </section>

      <section>
        <Footer />
      </section>
    </div>
  );
};

export default LandingPage;
