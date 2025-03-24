import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import LoginButton from '../components/LandingPageComponents/LoginButton';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [isAccepted, setIsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [rollNumber, setRollNumber] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setShowTerms(false); // Reset T&C visibility on modal close
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-[#1a1a1a] p-6 rounded-2xl shadow-2xl w-full max-w-md text-gray-100 border border-[#030712] border-opacity-80 shadow-[0_0_15px_#030712]
          max-h-[90vh] overflow-y-auto" // Ensures modal doesn't exceed 90% of viewport height
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-gray-200 transition-all"
          onClick={onClose}
        >
          <IoClose />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[80vh] px-4 pb-4">
          {/* Login Form */}
          {/* Login Form */}
<div className="bg-[#1a1a1a] p-6 md:p-5 rounded-xl shadow-xl border border-[#2c2c2c]">
  {/* Title */}
  <h5 className="text-2xl text-center font-extrabold text-gray-200 tracking-wide">
    👋 Welcome!
  </h5>

  {/* Form */}
  <form className="space-y-4 mt-4">
    {/* Roll Number Input */}
    <div>
      <label htmlFor="rollNumber" className="block mb-1 text-sm font-semibold text-gray-400">
        Roll Number
      </label>
      <input
        type="text"
        id="rollNumber"
        className="w-full p-3 border border-[#444] bg-[#292929] text-[#EAEAEA] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-md"
        placeholder="Enter your roll number"
        value={rollNumber}
        onChange={(e) => setRollNumber(e.target.value)}
        required
      />
    </div>

    {/* Submit Button */}
    <button
      type="submit"
      className="w-full mt-3 bg-gradient-to-r from-[#4C3BCF] to-[#3DC2EC] text-white font-semibold py-3 rounded-lg shadow-lg hover:scale-[1.02] transition-all duration-200 hover:shadow-xl"
    >
      Submit
    </button>
  </form>
</div>


          {/* Terms and Conditions */}
          {showTerms && (
            <div className="p-4 bg-[#292929] rounded-md text-sm text-gray-300 mt-4 max-h-[200px] overflow-y-auto">
              <h3 className="text-xl font-bold text-[#ffff]">📜 Terms & Conditions</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  This application is an <span className="font-semibold">unofficial platform</span> and is not affiliated with NSUT.
                </li>
                <li>
                  While we aim for accuracy, we <span className="font-semibold">do not guarantee</span> all information is up to date or correct.
                </li>
                <li>
                  The developers are <span className="font-semibold">not responsible</span> for any issues arising from this app.
                </li>
                <li>
                  Users should verify critical details from <span className="font-semibold">official NSUT sources</span>.
                </li>
                <li>We respect your privacy—no personal data is shared for commercial purposes.</li>
                <li>The developers or the algorithm society are <span className="font-semibold">not responsible</span> for any data obtained from this tool.</li>

              </ul>
              
              <p className="text-sm text-gray-400 italic mt-2">
                By continuing, you acknowledge that you have read and agree to these terms.
              </p>
              
            </div>
          )}

          {/* Checkbox for T&C Agreement */}
          <div className="mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAccepted}
                onChange={(e) => setIsAccepted(e.target.checked)}
                className="accent-blue-500 w-5 h-5 cursor-pointer"
              />
              <span className="text-sm text-gray-400">
                I accept the{' '}
                <span
                  className="underline cursor-pointer hover:text-gray-200"
                  onClick={() => setShowTerms(!showTerms)}
                >
                  Terms and Conditions
                </span>
              </span>
            </label>
          </div>

          {/* Login Button */}
          <div className={`mt-4 transition-all ${isAccepted ? '' : 'opacity-50 pointer-events-none'}`}>
            <LoginButton isAccepted={isAccepted} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
