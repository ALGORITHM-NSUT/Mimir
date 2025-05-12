import Logo from "/Mimir_logo.png"; 

const Footer = () => {
  return (
    <footer className="bg-transparent text-gray-300 py-6 px-6 md:px-12 border-t border-gray-800 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <img src={Logo} alt="Mimir Logo" className="h-8 w-auto" />
          <span className="text-lg tracking-wide">Mimir</span>
        </div>

        <div className="text-sm text-center md:text-right leading-relaxed">
          Built with <span className="text-red-500">❤️</span> by{" "}
          <a
            href="https://algorithm-east.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-gray-300 transition"
          >
            Algorithm Society, NSUT East
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
