import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import axios from "axios";
import { UserContext } from "../Context/UserContext";

const StarRating = ({ value, setValue }) => {
  return (
    <div className="flex mt-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`cursor-pointer text-4xl transition-transform transform duration-200
            ${star <= value ? "text-yellow-400 scale-110" : "text-gray-500"}`}
          onMouseEnter={() => setValue(star)}
          onClick={() => setValue(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const FeedbackModal = ({ isOpen, onClose }) => {
  const [accuracy, setAccuracy] = useState(0);
  const [performance, setPerformance] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!accuracy || !performance || !feedback.trim()) {
      alert("Please provide ratings and feedback.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/feedback/record`,
        { accuracy, performance, feedback, user }
      );

      if (response.status === 200 || response.status === 201) {
        alert("Feedback submitted successfully!");
        setAccuracy(0);
        setPerformance(0);
        setFeedback("");
        onClose();
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);

      if (error.response) {
        alert(`Error: ${error.response.data.detail || "Something went wrong!"}`);
      } else if (error.request) {
        alert("No response from server. Please check your internet connection.");
      } else {
        alert("An error occurred while submitting feedback.");
      }
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1b1c1d] rounded-xl p-6 max-w-md w-full shadow-xl border border-gray-950 text-white relative"
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">Feedback</h2>

        <div className="mb-4">
          <label className="font-medium">Accuracy</label>
          <StarRating value={accuracy} setValue={setAccuracy} />
        </div>

        <div className="mb-4">
          <label className="font-medium">Performance</label>
          <StarRating value={performance} setValue={setPerformance} />
        </div>

        <textarea
          className="w-full p-2 rounded bg-gray-700 text-white mb-4"
          rows="4"
          placeholder="Share your thoughts or suggestions here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />

        <p className="text-xs text-gray-400 mb-4">
          Your feedback helps us improve our system's quality and performance.
        </p>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default FeedbackModal;