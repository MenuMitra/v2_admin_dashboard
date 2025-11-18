import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faChevronDown,
  faUser,
  faSignOutAlt,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useAdmin } from "../hooks/useAdmin";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { API_CONFIG } from "../config/appConfig";
import logo from "../assets/images/logo/logo.png";
import Modal from "./common/Modal";

// Helper function to capitalize first letter
const capitalizeFirstLetter = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const Header = ({ sidebarToggle, setSidebarToggle }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { adminData, clearAdmin } = useAdmin();
  const { getToken, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isTestingEnv = BASE_URL === "https://menu4.xyz/v2";

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BASE_URL}/common/logout`,
        {
          user_id: adminData.user_id,
          role: adminData.role,
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );
      clearAdmin();
      logout();
      setDropdownOpen(false);
      navigate("/");
    } catch (error) {
      
    }
  };

  return (
    <>
      {/* Testing Environment Banner (only for testing base URL) */}
      {isTestingEnv && (
        <div
          style={{
            width: "100%",
            backgroundColor: "#b22222",
            color: "#fff",
            textAlign: "center",
            padding: "3px 0",
            fontSize: "14px",
            fontWeight: "bold",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1100,
          }}
        >
          Testing Environment
        </div>
      )}
      
      <header className="sticky top-0 z-99999 flex w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900" style={{ marginTop: isTestingEnv ? "30px" : "0px" }}>
      <div className="flex w-full items-center justify-between px-4 py-2 lg:px-6">
        {/* Left Section - Logo and Toggle */}
        <div className="flex items-center gap-4">
          {/* Hamburger Toggle Button */}
          <button
            className={`flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 ${
              sidebarToggle ? "bg-gray-100 dark:bg-gray-800" : ""
            }`}
            onClick={() => setSidebarToggle(!sidebarToggle)}
          >
            <FontAwesomeIcon
              icon={sidebarToggle ? faBars : faBars}
              className="h-5 w-5"
            />
          </button>
          {/* Update the search button Link */}
          <Link to="/search?focus=true">
            <button
              className={`flex h-10 w-24 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 w-28`}
            >
              <FontAwesomeIcon icon={faSearch} className="h-5 w-5 pr-1" />
              Search
            </button>
          </Link>
          {/* Logo - Always visible */}
          {/* <Link to="/" className="flex items-center">
            <img className="h-8 w-auto dark:hidden" src={logo} alt="Logo" />
            <img className="hidden h-8 w-auto dark:block" src={logo} alt="Logo" />
          </Link> */}
        </div>

        {/* Right Section - Admin Profile */}
        {adminData && (
          <div className="flex items-center">
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-gray-600 dark:text-gray-400"
                  />
                </span>
                <span className="hidden text-sm font-medium sm:block">
                  {capitalizeFirstLetter(adminData.name)}
                </span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`h-4 w-4 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                    <div className="mb-2 p-2">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {capitalizeFirstLetter(adminData.name)}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {adminData.email}
                      </p>
                    </div>
                  </Link>
                  <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-error-600 hover:bg-error-50 dark:text-error-500 dark:hover:bg-error-950"
                    onClick={() => setShowLogoutConfirm(true)}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>

    {/* Logout Confirm Modal */}
    <Modal
      isOpen={showLogoutConfirm}
      onClose={() => setShowLogoutConfirm(false)}
      type="error"
      size="small"
      title=""
      showCloseButton={false}
    >
      <div className="flex flex-col items-center gap-4">
        <FontAwesomeIcon icon={faSignOutAlt} className="w-50 h-50 text-error-700" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90 text-center">
          Are you sure you want to logout?
        </h3>
        <div className="flex justify-between w-full gap-4 mt-2">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(false)}
            className="flex-1 flex justify-center rounded-full px-4 py-3 text-theme-sm font-medium shadow-theme-xs border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setShowLogoutConfirm(false);
              handleLogout();
            }}
            className="flex-1 flex justify-center rounded-full px-4 py-3 text-theme-sm font-medium shadow-theme-xs border border-error-300 text-error-400 hover:text-error-600 hover:bg-error-50"
          >
            Exit Me
          </button>
        </div>
      </div>
    </Modal>
    </>
  );
};

export default Header;