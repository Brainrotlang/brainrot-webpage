// src/MainContent.tsx
import React from "react";
import { Typography, Box, Paper, Divider } from "@mui/material";

const MainContent: React.FC = () => {
  return (
    <Box sx={{ maxWidth: 800, margin: "auto", padding: 2 }}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          The Brainrot Programming Language
        </Typography>
        <Typography variant="body1" paragraph>
          A Meme-Fueled Journey into Compiler Design, Internet Slang, 
          and Skibidi Toilets.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" gutterBottom>
          1. Foreword
        </Typography>
        <Typography variant="body2" paragraph>
          “What if there was a programming language that replaced every single 
          keyword with internet slang?” That single question captures the 
          essence of Brainrot...
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Add more sections referencing your doc content */}
        <Typography variant="h5" gutterBottom>
          2. Introduction
        </Typography>
        <Typography variant="body2" paragraph>
          Brainrot might not be the language you asked for, but it might just 
          be the language you need...
        </Typography>
      </Paper>
    </Box>
  );
};

export default MainContent;
