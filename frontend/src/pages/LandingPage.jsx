import React, { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; 
import Navbar from "../components/LandingPageComponents/Navbar";
import GetStarted from "../components/LandingPageComponents/GetStarted";
import Features from "../components/LandingPageComponents/Features";
import FAQ from "../components/LandingPageComponents/FAQ";
import Footer from "../components/LandingPageComponents/Footer";
import { UserContext } from "../context/UserContext";

const LandingPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const faqRef = useRef(null);
  const getStartedRef = useRef(null);

  useEffect(() => {
    if (user?.userId) {
      navigate("/new", { replace: true });
    }
  }, [user, navigate]); 

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative bg-gray-950">
      <Navbar scrollToSection={scrollToSection} featuresRef={featuresRef} faqRef={faqRef} getStartedRef={getStartedRef}  />

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
