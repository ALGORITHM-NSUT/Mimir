import React, { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How does Mimir work?",
      answer:
        "Mimir is an AI-powered tool that retrieves information from university notices, circulars, and other documents using advanced retrieval techniques.",
    },
    {
      question: "Is Mimir free to use?",
      answer:
        "Yes, Mimir is completely free for NSUT students. Simply log in with your official NSUT ID to access all features.",
    },
    {
      question: "Can I access old university notices?",
      answer:
        "Yes, Mimir has an indexed archive of past university notices, allowing you to quickly find information from previous semesters.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="p-6 bg-gray-950 mb-10">
      <h2 className="text-3xl font-bold text-gray-100 text-center mb-8">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4 max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-gray-100 p-5 rounded-xl shadow-lg transition-all duration-300"
          >
            {/* Question Header */}
            <button
              className="flex justify-between items-center w-full text-left focus:outline-none"
              onClick={() => toggleFAQ(index)}
              aria-expanded={openIndex === index}
            >
              <h3 className="text-lg font-semibold text-gray-800">{faq.question}</h3>
              <motion.span
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-xl text-gray-600"
              >
                {openIndex === index ? <FaTimes /> : <FaPlus />}
              </motion.span>
            </button>

            {/* Answer Section with Smooth Animation */}
            <motion.div
              initial={false}
              animate={{
                height: openIndex === index ? "auto" : 0,
                opacity: openIndex === index ? 1 : 0,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden text-gray-700"
            >
              <p className="mt-3">{faq.answer}</p>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
