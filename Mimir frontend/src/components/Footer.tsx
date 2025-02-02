import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-8">
      <div className="max-w-7xl mx-auto text-center">
        <p>&copy; 2025 My Website. All rights reserved.</p>
        <div className="space-x-4 mt-2">
          <a href="/privacy" className="hover:text-gray-400">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-gray-400">
            Terms of Service
          </a>
          <a href="/contact" className="hover:text-gray-400">
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
