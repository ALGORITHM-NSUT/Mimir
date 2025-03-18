import React, { useEffect } from 'react';

const ScrollPrompt = ({title}) => {
  useEffect(() => {
    const scrollPrompt = document.getElementById('scrollPrompt');
    const interval = setInterval(() => {
      scrollPrompt.classList.toggle('opacity-100');
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleScroll = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div
      id="scrollPrompt"
      onClick={handleScroll}
      className="fixed bottom-8 sm:bottom-6 cursor-pointer transition-opacity duration-300 flex flex-col items-center"
    >
      <div className="animate-bounce">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            d="M5 15l7 7 7-7"
          />
        </svg>
      </div>
      <p className='text-white'>{title}</p>
    </div>
  );
};

export default ScrollPrompt;
