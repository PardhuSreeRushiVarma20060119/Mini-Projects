import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Import Merriweather, Open Sans, and Playfair Display from Google Fonts
// (This would normally be in the HTML file, but we're including it here for completeness)

createRoot(document.getElementById("root")!).render(<App />);
