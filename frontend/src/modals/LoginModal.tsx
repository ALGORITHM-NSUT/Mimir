import React, { useState } from "react";
import LoginButton from "../components/LandingPageComponents/LoginButton";

const LoginModal = ({ isOpen, onClose }) => {
  const [rollNumber, setRollNumber] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null; // Prevent rendering when modal is closed

  const validateRollNumber = () => {
    if (!rollNumber) return; // Don't show error if empty

    const rollNumberRegex = /^[0-9]{4}[A-Z]{3}[0-9]{4}$/;
    if (!rollNumberRegex.test(rollNumber)) {
      setError("Invalid roll number format (YYYYXXX0000)");
    } else {
      setError(""); // Clear error if valid
    }
  };

  const handleRollNumberChange = (e) => {
    setRollNumber(e.target.value.toUpperCase()); // Convert to uppercase
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 mx-5 z-100"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 text-white p-8 rounded-2xl shadow-xl w-96 relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-200 text-lg"
        >
          ✕
        </button>

        {/* Modal Title */}
        <h2 className="text-3xl font-extrabold text-center mb-6 text-purple-400">
          Login
        </h2>

        {/* Roll Number Input */}
        <div>
          
          <input
            type="text"
            value={rollNumber}
            onChange={handleRollNumberChange}
            onBlur={validateRollNumber} // Validate only when user moves away
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 
                      transition-all duration-200 placeholder-gray-400"
            placeholder="Enter your roll number"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={() => setTermsAccepted(!termsAccepted)}
            className="w-4 h-4 text-purple-500 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
            I accept the{" "}
            <a href="#" className="text-purple-400 hover:underline">
              Terms and Conditions
            </a>
          </label>
        </div>

        {/* Google Login Button */}
        <div
          className={`w-full mt-4 p-3 rounded-lg font-semibold flex justify-center items-center 
                      transition-all duration-200 ${
            termsAccepted && !error && rollNumber
              ? "cursor-pointer"
              : " cursor-not-allowed opacity-50 pointer-events-none"
          }`}
        >
          <LoginButton />
        </div>

        {/* Already a User? */}
        <p className="text-center text-sm text-gray-400 mt-4">
          Already a user?{" "}
          <a href="#" className="text-purple-400 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
