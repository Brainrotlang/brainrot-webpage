// src/DarkTheme.ts
import { createTheme } from "@mui/material/styles";

const DarkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
    background: {
      default: "#0f0f0f",
      paper: "#181818",
    },
    text: {
      primary: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
  },
});

export default DarkTheme;
