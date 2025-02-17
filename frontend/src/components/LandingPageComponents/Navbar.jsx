import React from "react";

const Navbar = ({ scrollToSection, featuresRef, faqRef, getStartedRef, isVisible  }) => {
  return (
    <nav className= {`fixed top-0 left-0 w-full bg-[#faf9f5] text-black py-4 shadow-md z-50 transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="container mx-auto flex justify-between items-center px-6">
        {/* Logo */}
        <div>
          <img src="Mimir_logo.png" alt="Mimir Logo" className="h-10 w-auto" />
        </div>

        {/* Navigation Buttons */}
          <div className="flex justify-around space-x-6">
            <div className="hidden sm:flex space-x-6 ">
              <button onClick={() => scrollToSection(featuresRef)} className="hover:text-gray-400">Features</button>
              <button onClick={() => scrollToSection(faqRef)} className="hover:text-gray-400">FAQ</button>
            </div>

            {/* Get Started (Always Visible) */}
            <button
              onClick={() => scrollToSection(getStartedRef)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Get Started
            </button>
          </div>

       
      </div>
    </nav>
  );
};

export default Navbar;
