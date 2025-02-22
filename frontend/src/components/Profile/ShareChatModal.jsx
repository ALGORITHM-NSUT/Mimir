import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button} from "../ui/button";
import { Input } from "../ui/input";
import { FaCopy } from "react-icons/fa";
import axios from "axios";

const ShareChatModal = ({ open, onClose }) => {
  const [shareableLink, setShareableLink] = useState("");

  const generateShareableLink = async () => {
    const newUrl = `${window.location.href}?share=true`;
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat/share`, { url: newUrl });
      setShareableLink(newUrl);
    } catch (error) {
      console.error("Error generating share link:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-6 rounded-xl bg-[#2a2a2a] text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Share Chat</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-300 mb-4">Copy and share this link:</p>
        <div className="flex items-center bg-gray-800 p-2 rounded-md">
          <Input type="text" value={shareableLink} readOnly className="w-full bg-transparent text-gray-300" />
          <FaCopy className="text-gray-400 cursor-pointer hover:text-white ml-2" onClick={() => navigator.clipboard.writeText(shareableLink)} />
        </div>
        <Button onClick={generateShareableLink} className="mt-4">Generate Link</Button>
      </DialogContent>
    </Dialog>
  );
};

export default ShareChatModal;
