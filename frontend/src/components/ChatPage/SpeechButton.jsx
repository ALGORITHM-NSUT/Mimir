import React, { useRef, useEffect } from "react";
import { FaMicrophone } from "react-icons/fa";

const SpeechButton = ({ setMessage, isListening, setIsListening }) => {
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.continuous = false; 
      recognitionRef.current.interimResults = true; 
    }

    const recognition = recognitionRef.current;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setMessage(transcript.trim()); 
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      recognition.onresult = null;
      recognition.onend = null;
    };
  }, [setMessage, setIsListening]);

  const handleSpeechToText = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setMessage(""); // Reset text on new click
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  return (
    <button
      className={`p-3 ml-2 text-gray-50 hover:text-gray-400 rounded-full bg-[#404040] hover:bg-[#505050] transition-all shadow-md ${
        isListening ? "animate-bounce shadow-blue-500 shadow-lg" : ""
      }`}
      onClick={handleSpeechToText}
    >
      <FaMicrophone size={22} />
    </button>
  );
};

export default SpeechButton;
