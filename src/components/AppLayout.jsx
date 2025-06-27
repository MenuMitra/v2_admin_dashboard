import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import TestEnvironmentBanner from "./Banner/TestEnvironmentBanner";

function AppLayout({ children }) {
  const [sidebarToggle, setSidebarToggle] = useState(false);
  
  return (
    <div>
      <TestEnvironmentBanner />
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
          <Header setSidebarToggle={setSidebarToggle} />
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout; 