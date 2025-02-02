import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

export default function SplitScreenChat() {
  const [prompt, setPrompt] = useState("");
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [showResponsePanel, setShowResponsePanel] = useState(false); // Controls the right panel

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && prompt.trim()) {
      handleSubmit();
    }
  }

  function handleButtonClick() {
    if (!prompt.trim()) return;
    handleSubmit();
  }

  function handleSubmit() {
    setPromptHistory((prevHistory) => [...prevHistory, prompt]);
    setPrompt("");
    setShowResponsePanel(true); // Show the right panel
  }

  useEffect(() => {
    console.log(promptHistory);
  }, [promptHistory]);

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-700">
      <div className="relative flex w-10/12 h-full">
        {/* Left Section: Moves when right panel appears */}
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: showResponsePanel ? "60%" : "100%" }} // Shrinks when right panel appears
          transition={{ duration: 0.5 }}
          className="flex flex-col p-4 bg-gray-800 shadow-lg rounded-lg h-full overflow-auto"
        >

          <h2 className="text-xl font-bold text-white">Your Prompts</h2>

          {/* Scrollable area for prompts */}
          <div className="mt-2 text-white flex-1 overflow-y-auto max-h-[70vh]">
            {promptHistory.map((prompt, index) => (
              <div key={index} className="mb-2">{prompt}</div>
            ))}
          </div>
          {/* Input & Button Panel (Sticky at Bottom) */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center">

            <div className="sticky bottom-0 flex justify-center w-9/12 h-25 bg-gray-700 p-4 shadow-lg rounded-lg">
              <Input
                placeholder="Enter your prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                handleKeyDown={handleKeyDown}
              />
              <Button handleButtonClick={handleButtonClick} disabled={!prompt.trim()}>
                Submit
              </Button>
            </div>
          </motion.div>
        </motion.div>
        {/* Right Section: Appears when submitting */}
        {showResponsePanel && (
          <motion.div
            initial={{ width: "0%", opacity: 0 }}
            animate={{ width: "40%", opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute right-0 top-0 h-full p-4 bg-gray-500 shadow-lg overflow-auto rounded-lg"
          >
            <h2 className="text-xl font-bold text-white">Response</h2>

            {/* Scrollable response area */}
            <div className="mt-2 text-white flex-1 overflow-y-auto max-h-[70vh]">
              <p>Generating response...</p>
              <p>Response content goes here...</p>
              {/* Add more text to test scrolling */}
              <p>Lorem ipsum dolor sit amet...</p>
              <p>More content...</p>
              <p>Even more content...</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
