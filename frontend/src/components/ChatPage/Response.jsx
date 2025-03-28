import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { FaMagic } from "react-icons/fa";

// ✅ Convert renderAnimatedText into a React Component
// Improved AnimatedText Component
const AnimatedText = ({ text = "" }) => {
  const [displayText, setDisplayText] = useState("");
  const speed = 30;

  useEffect(() => {
    // Ensure text is a string to prevent "undefined" issues
    const safeText = typeof text === 'string' ? text : '';
    setDisplayText(""); // Clear on new text

    // Skip animation for tables or code blocks
    if (safeText.includes("|") || safeText.includes("```")) {
      setDisplayText(safeText);
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      if (i < safeText.length) {
        setDisplayText((prev) => prev + safeText[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {displayText}
      </ReactMarkdown>
    </motion.div>
  );
};



// ✅ Response Component
const Response = ({ text, timestamp }) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    setRenderKey((prev) => prev + 1);
  }, [text]);

  useEffect(() => {
    const now = Date.now();
    setShouldAnimate(now - timestamp <= 1000);
  }, [timestamp]);

  const splitMarkdown = (mdText) => {
    const lines = mdText.split("\n");
    let segments = [];
    let currentSegment = [];
    let isTable = false;

    lines.forEach((line) => {
      if (line.startsWith("|")) {
        if (!isTable) {
          if (currentSegment.length) {
            segments.push({ type: "text", content: currentSegment.join("\n") });
            currentSegment = [];
          }
          isTable = true;
        }
        currentSegment.push(line);
      } else {
        if (isTable) {
          segments.push({ type: "table", content: currentSegment.join("\n") });
          currentSegment = [];
          isTable = false;
        }
        currentSegment.push(line);
      }
    });

    if (currentSegment.length) {
      segments.push({ type: isTable ? "table" : "text", content: currentSegment.join("\n") });
    }
    return segments;
  };

  const fixTableRows = (rows) => {
    const filteredRows = rows.filter((row, index) => !(index === 1 && /^\|?[-\s|]+\|?$/.test(row)));
    const maxCols = Math.max(...filteredRows.map((row) => row.split("|").length - 2));
    return filteredRows.map((row) => {
      let cells = row.split("|").map((cell) => cell.trim());
      cells = cells.filter((_, i) => i !== 0 && i !== cells.length - 1); // Remove empty first and last items
      while (cells.length < maxCols) cells.push(" "); // Fill missing columns
      return cells;
    });
  };

  const segments = splitMarkdown(text);

  return (
    <div key={renderKey} className="mt-2 max-w-full w-full text-white rounded-lg">
      <FaMagic className="mb-4 text-gray-400 text-md" />
      <div className="text-gray-300 text-sm md:text-base font-sans antialiased leading-[2] break-words whitespace-pre-wrap w-full max-w-full">
        {segments.map((segment, index) =>
          segment.type === "table" ? (
            <div key={index} className="overflow-x-auto">
              <table className="w-full border-collapse border border-[#2a2a2a] rounded-md shadow-lg">
                <tbody>
                  {fixTableRows(segment.content.split("\n")).map((cells, rowIndex) => (
                    <tr key={rowIndex} className="border border-[#2a2a2a] bg-[#1e1e1e] text-white">
                      {cells.map((cell, cellIndex) => (
                        <td key={cellIndex} className="p-3 border border-[#2a2a2a] text-center bg-[#333]">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{cell}</ReactMarkdown>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div key={index} className="mb-4 whitespace-pre-wrap">
              {shouldAnimate ? (
                <AnimatedText key={segment.content} text={segment.content} />
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{segment.content}</ReactMarkdown>
              )}

            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Response;