import React, { useRef, useState, useEffect } from "react";
import Navbar from "../components/LandingPageComponents/Navbar";
import GetStarted from "../components/LandingPageComponents/GetStarted";
import Features from "../components/LandingPageComponents/Features";
import FAQ from "../components/LandingPageComponents/FAQ";
import Footer from "../components/LandingPageComponents/Footer";

const LandingPage = () => {
  const featuresRef = useRef(null);
  const faqRef = useRef(null);
  const getStartedRef = useRef(null);
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsNavbarVisible(true);
      } else {
        setIsNavbarVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative bg-[#faf9f5]">
      {/* Navbar (Appears After Scrolling) */}
      <Navbar scrollToSection={scrollToSection} featuresRef={featuresRef} faqRef={faqRef} getStartedRef={getStartedRef} isVisible={isNavbarVisible} />

      {/* Sections */}
      <section ref={getStartedRef}>
        <GetStarted />
      </section>

      <section ref={featuresRef}>
        <Features />
      </section>

      <section ref={faqRef} >
        <FAQ />
      </section>

      <section>
        <Footer />
      </section>
    </div>
  );
};

export default LandingPage;
