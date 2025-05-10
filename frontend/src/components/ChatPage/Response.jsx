import React, { useEffect, useState } from "react";
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

  return (
    <div className="mt-2 ">
      <FaMagic className="mb-4 text-gray-200 text-md" />
      <div className="text-gray-300 text-sm md:text-base font-sans antialiased leading-relaxed break-words whitespace-pre-wrap ">
        <div className="overflow-auto">
          <div className="prose prose-invert max-w-none break-words whitespace-pre-wrap">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              components={{
                table: ({ children }) => (
                  <div className="overflow-x-auto w-full">
                    <table className="table-auto w-full">{children}</table>
                  </div>
                ),
                tr: TableRow,
                th: (props) => <TableCell {...props} isHeader />,
                td: TableCell,
              }}
            >
              {text}
            </ReactMarkdown>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Response;
