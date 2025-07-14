import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import TestEnvironmentBanner from "./Banner/TestEnvironmentBanner";
import { FullscreenProvider, useFullscreen } from "./FullscreenContext";

function AppLayoutInner({ children }) {
  const [sidebarToggle, setSidebarToggle] = useState(false);
  const { isFullscreen } = useFullscreen();
  
  return (
    <div>
      {/* Hide banner in fullscreen */}
      {!isFullscreen && <TestEnvironmentBanner />}
      <div className="flex h-screen overflow-hidden">
        {/* Add overlay for mobile */}
        {sidebarToggle && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={() => setSidebarToggle(false)}
          />
        )}
        <Sidebar sidebarToggle={sidebarToggle} />
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Hide header in fullscreen */}
          {!isFullscreen && <Header setSidebarToggle={setSidebarToggle} />}
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function AppLayout(props) {
  return (
    <FullscreenProvider>
      <AppLayoutInner {...props} />
    </FullscreenProvider>
  );
}

export default AppLayout; 