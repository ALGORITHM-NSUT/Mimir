import React, { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How does Mimir work?",
      answer: "Mimir is an AI-powered tool that retrieves information from university notices, circulars, and other documents using advanced retrieval techniques.",
    },
    {
      question: "Is Mimir free to use?",
      answer: "Yes, Mimir is completely free for NSUT students. Simply log in with your official NSUT ID to access all features.",
    },
    {
      question: "Can I access old university notices?",
      answer: "Yes, Mimir has an indexed archive of past university notices, allowing you to quickly find information from previous semesters.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="p-6 bg-[#faf9f5] my-10">
      <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md">
            {/* Question Header */}
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              <h3 className="text-lg font-semibold">{faq.question}</h3>
              <button className="text-xl text-gray-600">
                {openIndex === index ? <FaTimes /> : <FaPlus />}
              </button>
            </div>

            {/* Answer Section */}
            <div
              className={`mt-2 text-gray-700 transition-all duration-300 ${
                openIndex === index ? "block" : "hidden"
              }`}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
