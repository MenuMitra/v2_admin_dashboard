import React from "react";
import { Link } from "react-router-dom";
import { API_CONFIG } from "../../config/appConfig";

const TestEnvironmentBanner = () => {
  const isUsingProductionApi = () =>
    typeof API_CONFIG?.BASE_URL === "string" &&
    API_CONFIG.BASE_URL.includes("menu4.xyz");

  const isUsingTestingApi = () =>
    typeof API_CONFIG?.BASE_URL === "string" &&
    API_CONFIG.BASE_URL.includes("menusmitra.xyz");

  // Check if current domain is production
  const isProductionDomain = () => {
    const hostname = window.location.hostname;
    return (
      hostname === "menumitra.com" ||
      hostname === "user.menumitra.com" ||
      hostname === "www.menumitra.com" ||
      hostname === "www.user.menumitra.com" ||
      hostname === "admin-v2.menumitra.com" ||
      hostname === "www.admin-v2.menumitra.com" ||
      hostname === "admin.menumitra.com" ||
      hostname === "www.admin.menumitra.com"
    );
  };

  // Show banner only for testing environments
  const shouldShow =
    isUsingTestingApi() || (!isProductionDomain() && !isUsingProductionApi());

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="relative flex justify-center items-center px-2 py-1 text-white bg-warning-500 shadow-md transition-all duration-300">
      <span className="text-sm font-bold tracking-wide">
        Testing Environment
      </span>

      <Link
        to="https://admin-v2.menumitra.com"
        className="absolute right-2 flex items-center p-3 py-1 bg-gray-50 rounded-full font-semibold text-sm shadow-md transition-all duration-200 text-gray-700"
        target="_blank"
        rel="noopener noreferrer"
      >
        Prod
        <svg
          viewBox="0 0 10 10"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="ml-3 mt-0 w-[0.68em] h-[0.68em]"
        >
          <path
            d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
};

export default TestEnvironmentBanner;
