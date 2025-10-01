import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/style.css";
import "./assets/fonts.css";
import App from "./App.jsx";
import { QueryProvider } from "./lib/react-query/QueryProvider";
import FontProvider from "./components/common/FontProvider";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <QueryProvider>
    <FontProvider>
      <App />
    </FontProvider>
  </QueryProvider>
  // </StrictMode>,
);
