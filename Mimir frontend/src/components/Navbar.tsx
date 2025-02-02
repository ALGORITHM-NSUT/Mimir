import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-900 p-4">
      <div className="w-full flex justify-center items-center">
        <a href="/" className="text-white text-xl font-semibold">
          Mimir
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
