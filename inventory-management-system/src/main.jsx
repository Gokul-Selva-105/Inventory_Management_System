import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Import Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";

// Import custom styles
import "./index.css";
import "./styles/animations.css";
import "./styles/cursor-styles.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
