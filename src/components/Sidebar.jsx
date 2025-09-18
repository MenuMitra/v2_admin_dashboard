import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import {
  faHome,
  faStore,
  faQrcode,
  faLock,
  faUsers,
  faHandshake,
  faSearch,
  faUser,
  faChevronDown,
  faSignOut,
  faEllipsis,
  faUserShield,
  faIndianRupeeSign,
  faMobileScreenButton,
  faBell,
  faChartLine,
  faDatabase,
  faEnvelope,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";

// Import your logo images
import logo from "../assets/images/logo/logo.png";

// Remove menuData and MenuGroup logic
// Define menuGroups for visual grouping
const menuGroups = [
  {
    items: [{ title: "Home", path: "/home", id: "home", icon: faHome }],
  },
  {
    items: [
      { title: "Outlets", path: "/outlets", id: "outlets", icon: faStore },
      { title: "Admins", path: "/admins", id: "admins", icon: faUser },
      {
        title: "Partners",
        path: "/partners",
        id: "partners",
        icon: faHandshake,
      },
      { title: "Customers", path: "/customer", id: "customer", icon: faUser },
    ],
  },
  {
    items: [{ title: "Owners", path: "/owners", id: "owners", icon: faUsers }],
  },
  {
    items: [
      {
        title: "Super Owners",
        path: "/super-owners",
        id: "super-owners",
        icon: faUserShield,
      },
    ],
  },
  {
    items: [
      {
        title: "Subscriptions",
        path: "/subscriptions",
        id: "subscriptions",
        icon: faIndianRupeeSign,
      },
    ],
  },
  {
    items: [{ title: "Search", path: "/search", id: "search", icon: faSearch }],
  },
  {
    items: [
      {
        title: "Notifications",
        path: "/notifications",
        id: "notifications",
        icon: faBell,
      },
    ],
  },
  {
    items: [
      {
        title: "Enquiries",
        path: "/enquiries",
        id: "enquiries",
        icon: faEnvelope,
      },
      {
        title: "Bookings",
        path: "/bookings",
        id: "bookings",
        icon: faCalendarCheck,
      },
    ],
  },
  {
    items: [{ title: "Stats", path: "/stats", id: "stats", icon: faChartLine }],
  },
];

const Sidebar = ({ sidebarToggle = false }) => {
  const location = useLocation();
  const [page, setPage] = useState("ecommerce");
  const navigate = useNavigate();
  const { getToken, logout } = useAuth();
  const { adminData, clearAdmin } = useAdmin();

  const MenuGroup = ({ title, items }) => (
    <div>
      <h3 className="mb-4 text-xs leading-[20px] text-gray-400 uppercase">
        {/* <span
          className={`menu-group-title ${sidebarToggle ? "lg:hidden" : ""}`}
        >
          {title}
        </span> */}
        {/* <FontAwesomeIcon
          icon={faEllipsis}
          className={`menu-group-icon mx-auto fill-current ${
            sidebarToggle ? "lg:block hidden" : "hidden"
          }`}
        /> */}
      </h3>
      <ul className="mb-6 flex flex-col gap-4">
        {items.map((item, index) => (
          <MenuItem key={index} item={item} />
        ))}
      </ul>
    </div>
  );

  const MenuItem = ({ item }) => {
    const location = useLocation();

    // Updated isRouteActive function to handle nested routes
    const isRouteActive = (path) => {
      // Get the base route (e.g., 'owners', 'partners', etc.)
      const baseRoute = path.split("/")[1];
      const currentPath = location.pathname;

      // Define route patterns for each base route
      const routePatterns = {
        owners: ["/owners", "/create-owner", "/owner-details/", "/edit-owner/"],
        partners: [
          "/partners",
          "/create-partner",
          "/partner-details/",
          "/edit-partner/",
        ],
        outlets: [
          "/outlets",
          "/create-outlet",
          "/view-outlet/",
          "/edit-outlet/",
          "/menus/",
          "/menu-details/",
          "/edit-menu/",
          "/categories/",
          "/category-details/",
          "/edit-category/",
          // Staff sub-routes
          "/staff/",
          "/create-staff/",
          "/edit-staff/",
          "/staff-details/",
        ],
        admins: ["/admins", "/create-admin", "/admin-details/", "/edit-admin/"],
        "super-owners": [
          "/super-owners",
          "/create-super-owner",
          "/super-owner-details/",
          "/edit-super-owner/",
        ],
        "qr-templates": [
          "/qr-templates",
          "/create-template",
          "/template-details/",
          "/edit-template/",
        ],
        subscriptions: [
          "/subscriptions",
          "/create-subscription",
          "/edit-subscription/",
          "/view-subscription/",
        ],

        customer: ["/customer", "/customer-details", "/edit-customer"],
      };

      // For regular menu items
      if (routePatterns[baseRoute]) {
        return routePatterns[baseRoute].some((pattern) =>
          currentPath.startsWith(pattern)
        );
      }

      // Fallback for simple routes (dashboard, profile, etc.)
      return currentPath === path;
    };

    // Updated isActive logic
    const isActive = item.path
      ? isRouteActive(item.path)
      : item.items?.some((subItem) => isRouteActive(subItem.path));

    const hasDropdown = !!item.items;
    const isAccessControl = item.title === "Access Control";

    return (
      <li>
        {!isAccessControl ? (
          <Link
            to={item.path || "#"}
            className={`
              flex items-center gap-2 rounded-md px-3 py-2
              hover:bg-gray-100 
              ${isActive ? "bg-brand-100 text-brand-600" : ""}
              transition-all duration-300
            `}
          >
            <FontAwesomeIcon
              icon={item.icon || faEllipsis}
              className={`w-4 h-4 ${isActive ? "text-brand-600 " : ""}`}
            />
            <span
              className={`whitespace-nowrap text-sm ${
                sidebarToggle ? "lg:hidden" : ""
              }`}
            >
              {item.title}
            </span>
            {hasDropdown && (
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`ml-auto transition-transform duration-300 ${
                  isActive ? "rotate-180" : ""
                } ${sidebarToggle ? "lg:hidden" : ""}`}
              />
            )}
          </Link>
        ) : (
          <>
            <Link
              to={item.path}
              className={`
                flex items-center gap-3 rounded-md px-4 py-2.5
                hover:bg-gray-100 
                ${isActive ? "bg-brand-100 text-brand-600 " : ""}
                transition-all duration-300
              `}
            >
              <FontAwesomeIcon
                icon={item.icon}
                className={`w-5 h-5 ${isActive ? "text-brand-600 " : ""}`}
              />
              <span
                className={`whitespace-nowrap ${
                  sidebarToggle ? "lg:hidden" : ""
                }`}
              >
                {item.title}
              </span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`ml-auto transition-transform duration-300 ${
                  isActive ? "rotate-180" : ""
                } ${sidebarToggle ? "lg:hidden" : ""}`}
              />
            </Link>

            <div className={`block ${isActive ? "" : "hidden"}`}>
              <ul
                className={`menu-dropdown mt-2 flex flex-col gap-1 pl-9 ${
                  sidebarToggle ? "lg:hidden" : "flex"
                }`}
              >
                {item.items.map((subItem, idx) => (
                  <li key={idx}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item group ${
                        location.pathname === subItem.path
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={subItem.icon || faEllipsis}
                        className={`menu-item-icon ${
                          location.pathname === subItem.path
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                        }`}
                      />
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {hasDropdown && !isAccessControl && (
          <div
            className={`translate transform overflow-hidden ${
              isActive ? "block" : "hidden"
            }`}
          >
            <ul
              className={`menu-dropdown mt-2 flex flex-col gap-1 pl-9 ${
                sidebarToggle ? "lg:hidden" : "flex"
              }`}
            >
              {item.items.map((subItem, idx) => (
                <li key={idx}>
                  <Link
                    to={subItem.path}
                    className={`menu-dropdown-item group ${
                      location.pathname === subItem.path
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={subItem.icon || faEllipsis}
                      className={`menu-item-icon ${
                        location.pathname === subItem.path
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    />
                    {subItem.name}
                    {(subItem.pro || subItem.new) && (
                      <span className="absolute right-3 flex items-center gap-1">
                        {subItem.new && (
                          <span className="menu-dropdown-badge">New</span>
                        )}
                        {subItem.pro && (
                          <span className="menu-dropdown-badge">Pro</span>
                        )}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  };

  return (
    <aside
      className={`
        fixed top-10 left-0 z-50 flex h-screen w-[180px] flex-col 
        overflow-y-auto bg-white transition-transform duration-300
        border-r border-gray-200 
        lg:static lg:translate-x-0
        ${sidebarToggle ? "translate-x-0" : "-translate-x-full"}
        ${sidebarToggle ? "lg:w-[50px]" : "lg:w-[180px]"}
      `}
    >
      {/* Sidebar Header - Desktop */}
      <div
        className={`
          hidden lg:flex items-center justify-center gap-2 pt-6 pb-5 px-4
          ${sidebarToggle ? "justify-center" : "justify-center"}
        `}
      >
        <div className="flex items-center gap-2">
          <img className="w-8" src={logo} alt="Logo" />
          <span
            className={`text-xl font-semibold text-gray-900  ${
              sidebarToggle ? "lg:hidden" : ""
            }`}
          >
            ADMIN
          </span>
        </div>
      </div>
      {/* Menu Items */}
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear px-4 pb-10">
        <nav>
          {menuGroups.map((group, idx) => (
            <React.Fragment key={idx}>
              <ul className="flex flex-col gap-2">
                {group.items.map((item, index) => (
                  <MenuItem key={item.id || index} item={item} />
                ))}
              </ul>
              {idx !== menuGroups.length - 1 && (
                <hr className="my-2 border-t border-gray-200" />
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
