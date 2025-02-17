import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import ScrollPrompt from "./ScrollPrompt";
import { Link } from "react-router-dom";

const GetStarted = () => {
  const [showScrollPrompt, setShowScrollPrompt] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollPrompt(false); // Hide the prompt after scroll
      } else {
        setShowScrollPrompt(true); // Show the prompt when scrolled back to top
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      {/* Left Section: Logo, Description, Login Form */}
      <div className="flex flex-col justify-center items-center bg-[#faf9f5] px-8 py-6 h-screen">
        {/* Logo */}
        <div className="mb-6">
          <img src="Mimir_logo.png" alt="Mimir Logo" className="h-16 w-auto" />
        </div>

        {/* Description */}
        <div className="text-center w-3/4">
          <h1 className="text-4xl font-bold mb-4">Search Made Simple</h1>

          <p className="text-gray-700 text-lg mb-6">Login using your NSUT Email Id to Get Started</p>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-lg">
          <form>
            {/* Name */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Name</label>
              <input type="text" className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your name" />
            </div>

            {/* Semester */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold">Semester</label>
              <input type="number" min="1" max= "8" className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your semester" />
            </div>

            {/* Branch */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold">Branch</label>
              <input type="text" className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your branch" />
            </div>

            {/* Submit Button */}
            <Link type="button" className="w-full flex items-center justify-center bg-white text-gray-700 border border-gray-300 py-2 rounded-md shadow-sm hover:bg-gray-100" to = "/new">
              <FcGoogle  className="h-5 w-5 mr-2" />
              <h1 className="font-bold">Continue with Google</h1>
            </Link>
          </form>
        </div>
        {showScrollPrompt && <ScrollPrompt />}
      </div>

      {/* Right Section: Placeholder for Image Carousel */}
      <div className="bg-[#faf9f5] py-5 h-screen hidden sm:grid grid-cols-1 ">
        <div className="bg-[#f0eee7] justify-center items-center h-full hidden sm:flex rounded-tl-3xl rounded-bl-3xl">
          <p className="text-gray-600 text-xl">Image Carousel Here</p>
        </div>
      </div>
     
    </div>
  );
};

export default GetStarted;
