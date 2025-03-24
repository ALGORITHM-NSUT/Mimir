import React, { useState, useEffect } from "react";
import { Box, Typography, Stepper, Step, StepLabel, Paper, useMediaQuery } from "@mui/material";
import { FaSearch, FaFileAlt } from "react-icons/fa";
import { MdOutlineTextSnippet, MdOutlinePsychology } from "react-icons/md"; // Parsing & Understanding icons

const steps = ["Parsing", "Understanding", "Searching", "Retrieving Docs"];
const stepIcons = [
  <MdOutlineTextSnippet size={50} color="#a78bfa" />, // Parsing
  <MdOutlinePsychology size={50} color="#a78bfa" />, // Understanding
  <FaSearch size={50} color="#a78bfa" />, // Searching
  <FaFileAlt size={50} color="#a78bfa" />, // Retrieving Docs
];

const ChatLoader = () => {
  const [activeStep, setActiveStep] = useState(0);
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prevStep) => (prevStep < steps.length - 1 ? prevStep + 1 : prevStep));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    // <Paper sx={{ p: 3, textAlign: "center", mx: "auto", bgcolor: "transparent", boxShadow: "none" }}>
    //   <Typography variant="h6" fontWeight="bold" color="#a78bfa" gutterBottom>
    //     {steps[activeStep]}...
    //   </Typography>

    //   <Box display="flex" justifyContent="center" my={2}>
    //     {stepIcons[activeStep]}
    //   </Box>

    //   <Stepper activeStep={activeStep} alternativeLabel={!isMobile} orientation={isMobile ? "vertical" : "horizontal"}>
    //     {steps.map((label, index) => (
    //       <Step key={index}>
    //         <StepLabel
    //           sx={{
    //             "& .MuiStepLabel-label": { color: "#ddd", fontSize: isMobile ? "12px" : "14px" },
    //             "& .MuiStepIcon-root": { color: activeStep >= index ? "#a78bfa" : "#555" },
    //           }}
    //         >
    //           {label}
    //         </StepLabel>
    //       </Step>
    //     ))}
    //   </Stepper>
    // </Paper>

    <div>
      <span>Loading..</span>
    </div>
  );
};

export default ChatLoader;
