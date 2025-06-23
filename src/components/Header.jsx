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
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const { adminData, clearAdmin } = useAdmin();
  const { getToken, logout } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const notifications = [
    {
      id: 1,
      user: {
        name: "Terry Franci",
        image: "user-02.jpg",
        online: true,
      },
      project: "Project - Nganter App",
      time: "5 min ago",
    },
    // Add more notifications as needed
  ];

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

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark', 'bg-gray-900');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark', 'bg-gray-900');
    }
  }, [darkMode]);

  const handleSidebarToggle = () => {
    setSidebarToggle(prevState => {
      console.log('Current sidebar state:', prevState);
      const newState = !prevState;
      console.log('New sidebar state:', newState);
      return newState;
    });
  };

  const handleDarkModeToggle = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Early return if no admin data
  if (!adminData) {
    return null;
  }

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

          {/* Search Bar */}
          {/* <div className="hidden lg:block">
            <form>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2">
                  <FontAwesomeIcon 
                    icon={faMagnifyingGlass} 
                    className="fill-gray-500 dark:fill-gray-400" 
                  />
                </span>
                <input 
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search or type command..."
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pr-14 pl-12 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden xl:w-[430px] dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
                />
                <button className="absolute top-1/2 right-2.5 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                  <span>⌘</span>
                  <span>K</span>
                </button>
              </div>
            </form>
          </div> */}
        </div>

        {/* Right Side Menu */}
        <div
          className={`${
            menuToggle ? "flex" : "hidden"
          } shadow-theme-md w-full items-center justify-between gap-4 px-5 py-4 lg:flex lg:justify-end lg:px-0 lg:shadow-none`}
        >
            {/* Dark Mode Toggle */}
          {/* <div className="2xsm:gap-3 flex items-center gap-2">
            <button
              className="hover:text-dark-900 relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={handleDarkModeToggle}
            >
              <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
            </button>
          </div> */}

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
      </div>
    </header>
  );
};

export default Header;
