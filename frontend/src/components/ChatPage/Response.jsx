import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { FaMagic, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import axios from "axios";

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

const Response = ({ text, timestamp, messageId, upvote }) => {
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (upvote === 1) setFeedback("up");
    else if (upvote === -1) setFeedback("down");
    else setFeedback(null);
  }, [upvote]);

  const handleFeedback = async (type) => {
    const newFeedback = feedback === type ? null : type; // Toggle logic

    setFeedback(newFeedback);

    const upvoteValue = newFeedback === "up" ? 1 : newFeedback === "down" ? -1 : 0;

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/feedback/chat-feedback`, {
        messageId,
        upvote: upvoteValue,
      });
    } catch (error) {
      console.error("Error submitting feedback:", error.response?.data || error.message);
    }
  };

  return (
    <div className="mt-2 max-w-full w-full">
      <FaMagic className="mb-4 text-gray-200 text-md" />
      <div className="text-gray-300 text-sm md:text-base font-sans antialiased leading-relaxed break-words whitespace-pre-wrap w-full max-w-full">
        <div className="overflow-auto">
          <div className="prose prose-invert max-w-none break-words whitespace-pre-wrap">
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
              {text.replace(/```markdown|```/g, "")}
            </ReactMarkdown>
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