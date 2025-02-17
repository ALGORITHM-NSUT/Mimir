import React from "react";

const Features = () => {
  return (
    <div className="flex flex-col justify-center items-center px-6 py-10 sm:py-20 min-h-full bg-[#faf9f5]">
      {/* Heading and Description */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Meet Mimir</h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Mimir is an advancedRetrieval-Augmented Generation (RAG) based AI tool that helps you quickly 
          find relevant information from all university notices, circulars, and official documents.
        </p>
      </div>

      {/* Video & Key Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left: Video */}
        <div className="flex justify-center">
        <video autoPlay muted loop className="rounded-lg shadow-lg w-full max-w-lg">
          <source src="create.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        </div>

        {/* Right: Key Features */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <ul className="space-y-4 text-lg text-gray-700">
            <li>🔍 Instantly retrieve information from university notices & documents.</li>
            <li>🤖 AI-powered search for precise and contextual results.</li>
            <li>📂 Organized and categorized results for easy access.</li>
            <li>⚡ Saves time by eliminating the need to manually search through PDFs.</li>
            <li>🖥️ User-friendly interface designed for students and faculty.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Features;
