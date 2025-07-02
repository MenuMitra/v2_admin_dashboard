import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faChevronDown,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useAdmin } from "../hooks/useAdmin";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { API_CONFIG } from "../config/appConfig";
import logo from "../assets/images/logo/logo.png";

const Header = ({ sidebarToggle, setSidebarToggle }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { adminData, clearAdmin } = useAdmin();
  const { getToken, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { BASE_URL, API_VERSION } = API_CONFIG;

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BASE_URL}/${API_VERSION}/common/logout`,
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
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-99999 flex w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
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
              icon={sidebarToggle ? faXmark : faBars}
              className="h-5 w-5"
            />
          </button>

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
                  {adminData.name}
                </span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  <Link 
                    to="/profile" 
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="mb-2 p-2">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {adminData.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {adminData.email}
                      </p>
                    </div>
                  </Link>
                  <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-error-600 hover:bg-error-50 dark:text-error-500 dark:hover:bg-error-950"
                    onClick={handleLogout}
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
  );
};

export default Header;
