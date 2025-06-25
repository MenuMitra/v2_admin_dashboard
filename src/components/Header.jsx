import React, { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faEllipsisH,
  faMagnifyingGlass,
  faMoon,
  faSun,
  faBell,
  faChevronDown,
  faUser,
  faCog,
  faCircleInfo,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useAdmin } from "../hooks/useAdmin";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Import your logo images
import logo from "../assets/images/logo/logo.png";

const Header = ({ sidebarToggle, setSidebarToggle }) => {
  const [menuToggle, setMenuToggle] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const { adminData, clearAdmin } = useAdmin();
  const { getToken, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://men4u.xyz/v2/common/logout",
        {
          user_id: adminData.user_id,
          role: adminData.role,
          app: "admin_dashboard",
        },
        {
          headers: {
            Authorization: getToken(),
          },
        }
      );

      // Clear admin data from local storage
      clearAdmin();
      logout();

      // Close the dropdown
      setDropdownOpen(false);

      // Navigate to login page
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // You might want to show an error toast/notification here
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if it's Mac (Command + K) or Windows/Linux (Ctrl + K)
      const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
      const hotkey = isMac
        ? event.metaKey && event.key.toLowerCase() === "k"
        : event.ctrlKey && event.key.toLowerCase() === "k";

      if (hotkey) {
        event.preventDefault(); // Prevent default browser behavior
        searchInputRef.current?.focus();
      }
    };

    // Add event listener when component mounts
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener when component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Empty dependency array since we don't use any dependencies


  const handleSidebarToggle = () => {
    setSidebarToggle(prevState => {
      console.log('Current sidebar state:', prevState);
      const newState = !prevState;
      console.log('New sidebar state:', newState);
      return newState;
    });
  };

  return (
    <header className="sticky top-0 z-99999 flex w-full border-gray-200 bg-white lg:border-b dark:border-gray-800 dark:bg-gray-900">
      <div className="flex grow flex-col items-center justify-between lg:flex-row lg:px-6">
        <div className="flex w-full items-center justify-between gap-2 border-b border-gray-200 px-3 py-3 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4 dark:border-gray-800">
          {/* Hamburger Toggle Button */}
          <button
            className={`z-99999 flex h-10 w-10 items-center justify-center rounded-lg border-gray-200 text-gray-500 lg:h-11 lg:w-11 lg:border dark:border-gray-800 dark:text-gray-400 ${
              sidebarToggle
                ? "lg:bg-transparent dark:lg:bg-transparent bg-gray-100 dark:bg-gray-800"
                : ""
            }`}
            onClick={handleSidebarToggle}
          >
            <FontAwesomeIcon
              icon={sidebarToggle ? faXmark : faBars}
              className="fill-current"
            />
          </button>

          {/* Logo */}
          <Link to="/" className="lg:hidden">
            <img className="h-10 dark:hidden" src={logo} alt="Logo" />
            <img className="h-10 hidden dark:block" src={logo} alt="Logo" />

          </Link>

          {/* Menu Toggle Button */}
          <button
            className={`z-99999 flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800 ${
              menuToggle ? "bg-gray-100 dark:bg-gray-800" : ""
            }`}
            onClick={() => setMenuToggle(!menuToggle)}
          >
            <FontAwesomeIcon icon={faEllipsisH} className="fill-current" />
          </button>

        </div>

        {/* Right Side Menu - Only show if adminData exists */}
        {adminData && (
          <div
            className={`${
              menuToggle ? "flex" : "hidden"
            } shadow-theme-md w-full items-center justify-between gap-4 px-5 py-4 lg:flex lg:justify-end lg:px-0 lg:shadow-none`}
          >
            {/* User Profile */}
            <div className="relative">
              <button
                className="flex items-center text-gray-700 dark:text-gray-400"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="mr-3 h-11 w-11 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <FontAwesomeIcon 
                    icon={faUser} 
                    className="text-gray-600 dark:text-gray-400 text-xl"
                  />
                </span>
                <span className="text-theme-sm mr-1 block font-medium">
                  {adminData.name}
                </span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`stroke-gray-500 dark:stroke-gray-400 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* User Dropdown */}
              {dropdownOpen && (
                <div className="shadow-theme-lg dark:bg-gray-dark absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800">
                  <div className="mb-2 p-2">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {adminData.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {adminData.email}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {adminData.role}
                    </p>
                  </div>
                  <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                    View Profile
                  </Link>
                  <button
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-error-600 hover:bg-error-50 dark:text-error-500 dark:hover:bg-error-950"
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                    Sign Out
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
