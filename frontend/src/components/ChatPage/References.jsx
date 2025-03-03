import React, { useEffect } from "react";
import { BsFileEarmarkTextFill } from "react-icons/bs";

const References = ({ references }) => {
  
  return (
    <>
    {
      references.length == 0? <> </> :
      <>
        <div className="mt-2 bg-[#1b1c1d75] shadow-md rounded-2xl py-10 px-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">References</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
            {references.map((ref, index) => (
              <a
                key={index}
                href={ref.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl shadow-lg transition duration-300 
                bg-gradient-to-r from-[#2E2E2E] via-[#2f2e2e] to-[#2E2E2E] 
                hover:from-[#3E3E3E] hover:via-[#525252] hover:to-[#3E3E3E]"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  {/* Icon with fixed size */}
                  <BsFileEarmarkTextFill className="w-6 h-6 flex-shrink-0 text-gray-400" />

                  {/* Truncation Fix */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200 font-medium w-full overflow-hidden truncate">
                      {ref.title}
                    </p>
                    <p className="text-gray-400 text-sm w-full overflow-hidden truncate">
                      {ref.link}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
    </>

    }
    </>

  );
};

export default References;
