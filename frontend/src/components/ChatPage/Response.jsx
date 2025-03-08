import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { FaMagic } from "react-icons/fa";

const Table = ({ children }) => (
  <div className="relative w-full border-[1px]  border-gray-700  overflow-x-auto shadow-md sm:rounded-lg my-4">
    <table className="w-full text-sm text-left text-white">
      {children}
    </table>
  </div>
);

const TableRow = ({ children, isHeader }) => {
  const baseClass = "border-b border-gray-700  transition-colors";
  const headerClass = isHeader ? "" : "";
  return <tr className={`${baseClass} ${headerClass}`}>{children}</tr>;
};

const TableCell = ({ children, isHeader }) => {
  if (isHeader) {
    return (
      <th
        scope="col"
        className="px-6 py-3 sticky top-0 bg-gray-700 font-medium text-white whitespace-nowrap"
      >
        {children}
      </th>
    );
  }
  return (
    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-700 last:border-r-0">
      {children}
    </td>
  );
};

const Response = ({ text }) => {
  return (
    <div className="mt-2 max-w-full w-full">
      <FaMagic className="mb-4 text-purple-400 text-md" />
      <div className="text-gray-300 text-sm md:text-base font-sans antialiased leading-relaxed">
        <div className="overflow-x-auto w-full">
          <div className="w-full">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
              components={{
                // Table components
                table: Table,
                tr: (props) => <TableRow {...props} isHeader={false} />,
                thead: ({ children }) => (
                  <thead className="text-gray-100 uppercase bg-gray-700">
                    {React.Children.map(children, (child) =>
                      React.cloneElement(child, { isHeader: true })
                    )}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-gray-700">{children}</tbody>
                ),
                th: (props) => <TableCell {...props} isHeader />,
                td: (props) => <TableCell {...props} isHeader={false} />,
                
                // Other markdown components
                p: ({ node, ...props }) => (
                  <p className="mb-4 text-gray-300" {...props} />
                ),
                h1: ({ node, ...props }) => (
                  <h1 className="text-2xl font-bold mb-4 text-white" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-xl font-bold mb-3 text-white" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-lg font-bold mb-2 text-white" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-gray-300" {...props} />
                ),
                code: ({ node, inline, ...props }) => (
                  <code className="px-2 py-1 bg-gray-700 rounded-md text-sm" {...props} />
                ),
                pre: ({ node, ...props }) => (
                  <pre className="p-4 bg-gray-800 rounded-lg overflow-x-auto mb-4" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className=" border-purple-500 pl-4 my-4 italic" {...props} />
                ),
                a: ({ node, href, ...props }) => (
                  <a
                    href={href}
                    className="text-purple-400 hover:text-purple-300 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
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