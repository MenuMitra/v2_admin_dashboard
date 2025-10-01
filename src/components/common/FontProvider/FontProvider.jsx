import React, { useEffect } from "react";

// Centralized font control. Change DEFAULT_FONT once to switch the app font.
const DEFAULT_FONT =
  "Lato";

function FontProvider({ fontFamily = DEFAULT_FONT, children }) {
  useEffect(() => {
    // Expose as CSS variable so all CSS can consume it
    document.documentElement.style.setProperty("--app-font-family", fontFamily);
  }, [fontFamily]);

  return children;
}

export default FontProvider;
