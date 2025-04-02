import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const RenderAnimatedText = ({ text = "" }) => {
  const [displayText, setDisplayText] = useState("");
  const safeText = text || "";
  const speed = 30;

  useEffect(() => {
    let interval;

    // Reset displayText when text changes
    setDisplayText("");

    if (safeText.includes("|")) {
      setDisplayText(safeText); // Instantly show if table
    } else {
      let i = 0;
      interval = setInterval(() => {
        setDisplayText((prev) => prev + safeText[i]);
        i++;

        if (i >= safeText.length) clearInterval(interval);
      }, speed);
    }

    // Cleanup function to stop ongoing animation
    return () => {
      clearInterval(interval);
    };
  }, [text]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayText}</ReactMarkdown>
    </motion.div>
  );
};

export default RenderAnimatedText;
