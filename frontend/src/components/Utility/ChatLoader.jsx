import React from "react";
import "ldrs/helix";
import { Box, Typography } from "@mui/material";

const ChatLoader = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        p: "10px",
        backgroundColor: "rgba(255, 255, 255, 0.08)", // Subtle background
        borderRadius: "18px",
        maxWidth: "max-content",
        color: "#ffffff",
      }}
    >
      {/* Loader Animation */}
      <Box display="flex" alignItems="center">
        <l-helix size="30" speed="1.8" color="#ffffff"></l-helix>
      </Box>

      {/* Text Next to Loader */}
      <Typography
        variant="body2"
        sx={{
          color: "#ffffff",
          fontSize: "0.95rem",
          opacity: "0.8",
        }}
      >
        Searching...
      </Typography>
    </Box>
  );
};

export default ChatLoader;
