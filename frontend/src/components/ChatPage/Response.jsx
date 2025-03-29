import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { FaMagic, FaThumbsUp, FaThumbsDown } from "react-icons/fa";

const Table = ({ children }) => (
  <div className="overflow-auto max-h-96">
    <table className="w-full border border-gray-500">{children}</table>
  </div>
);

const TableRow = ({ children }) => (
  <tr className="border-b border-gray-700 transition-colors">{children}</tr>
);

const TableCell = ({ children, isHeader }) => {
  const baseStyle = "border border-gray-500 px-4 py-2";
  const headerStyle = "bg-gray-700 text-white";
  return isHeader ? (
    <th className={`${baseStyle} ${headerStyle} sticky top-0`}>{children}</th>
  ) : (
    <td className={baseStyle}>{children}</td>
  );
};

const Response = ({ text, timestamp, onFeedback }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const len = text.length;

  // Detect if text contains a table (Markdown syntax) or bold Markdown (**text**)
  const containsTable = /\|\s*.+\s*\|/g.test(text) && /---/g.test(text);
  const containsBoldText = /\*\*(.*?)\*\*/.test(text);

  useEffect(() => {
    if (!containsTable && !containsBoldText) {
      const now = Date.now();
      if (timestamp && now - timestamp <= 200) {
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), len * 300);
      }
    }
  }, [timestamp, containsTable, containsBoldText]);

  const handleFeedback = (type) => {
    setFeedback(type);
    if (onFeedback) onFeedback(type);
  };

  return (
    <div className="mt-2 max-w-full w-full">
      <FaMagic className="mb-4 text-gray-200 text-md" />
      <div className="text-gray-300 text-sm md:text-base font-sans antialiased leading-relaxed break-words whitespace-pre-wrap w-full max-w-full">
        <div className="overflow-auto">
          <div className="prose prose-invert max-w-none break-words whitespace-pre-wrap">
            {showAnimation ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 1.0,
                  staggerChildren: 0.05,
                }}
              >
                {text.split(" ").map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="inline-block mr-1"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={{
                  table: Table,
                  tr: TableRow,
                  th: (props) => <TableCell {...props} isHeader />,
                  td: TableCell,
                }}
              >
                {text}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          className={`mr-2 ${feedback === "up" ? "text-gray-100" : "text-gray-500"}`}
          onClick={() => handleFeedback("up")}
        >
          <FaThumbsUp />
        </button>
        <button
          className={`ml-2 ${feedback === "down" ? "text-red-500" : "text-gray-500"}`}
          onClick={() => handleFeedback("down")}
        >
          <FaThumbsDown />
        </button>
      </div>
    </div>
  );
};

export default Response;
