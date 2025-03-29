import React, { useState } from "react";
import RegisterButton from "../components/LandingPageComponents/RegisterButton";
import LoginButton from "../components/LandingPageComponents/LoginButton";
import { Link } from "react-router-dom";

const LoginModal = ({ isOpen, onClose }) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1b1c1d] text-white p-6 md:p-8 rounded-xl shadow-2xl w-80 md:w-96 relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-xl focus:outline-none"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Conditional Rendering for Modals */}
        {!showWelcomeBack ? (
          <>
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-purple-300">
              Register
            </h2>

            {/* Terms & Conditions */}
            <div className="flex items-center mt-4 text-sm text-gray-300">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
                className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="terms" className="ml-2">
                I accept the
                <Link to="/terms" className="text-purple-400 hover:underline ml-1">
                  Terms and Conditions
                </Link>
              </label>
            </div>

            {/* Buttons */}
            <div className="w-full mt-6 flex flex-col gap-3">
        
              <div className="relative">
                {!termsAccepted && (
                  <div className="absolute inset-0 bg-transparent cursor-not-allowed z-100 opacity-15" />
                )}

                <RegisterButton  />
              </div>

              <button
                onClick={() => setShowWelcomeBack(true)}
                className="w-full bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Already registered? Login
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6 text-green-300">
              Welcome Back!
            </h2>
            <p className="text-gray-300 text-center mb-4">
              Please log in to continue.
            </p>
            <LoginButton />
          </>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
