import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';
import {
  faGrip,
  faStore,
  faQrcode,
  faLock,
  faUsers,
  faHandshake,
  faSearch,
  faTicket,
  faUser,
  faChevronDown,
  faSignOut,
  faEllipsis,
  faUserShield,
  faList
} from "@fortawesome/free-solid-svg-icons";

// Import your logo images
import logo from '../assets/images/logo/logo.png';

const menuData = {
  MENU: [
    // {
    //   title: 'Dashboard',
    //   icon: faGrip,
    //   items: [
    //     { name: 'eCommerce', path: '/', id: 'ecommerce' },
    //     { name: 'Analytics', path: '/analytics', id: 'analytics', pro: true },
    //     { name: 'Marketing', path: '/marketing', id: 'marketing', pro: true },
    //     { name: 'CRM', path: '/crm', id: 'crm', pro: true },
    //     { name: 'Stocks', path: '/stocks', id: 'stocks', pro: true, new: true },
    //     { name: 'SaaS', path: '/saas', id: 'saas', pro: true, new: true }
    //   ]
    // },
    {
      title: "Home",
      path: "/dashboard",
      id: "dashboard",
      icon: faGrip,
    },
    {
      title: "Admins",
      path: "/admins",
      id: "admins",
      icon: faUser,
    },
    {
      title: "Owners",
      path: "/owners",
      id: "owners",
      icon: faUsers,
    },
    {
      title: "Super Owners", 
      path: "/super-owners",
      id: "super-owners",
      icon: faUserShield,
    },
    {
      title: "Partners",
      path: "/partners",
      id: "partners",
      icon: faHandshake,
    },
    {
      title: "Outlets",
      path: "/outlets",
      id: "outlets",
      icon: faStore,
    },
    {
      title: "Access Control",
      icon: faLock,
      items: [
        { name: "Roles", path: "/roles", icon: faUserShield },
        { name: "Functionalities", path: "/functionalities",  icon: faList },
      ],
    },
    {
      title: "Search",
      path: "/search",
      id: "search",
      icon: faSearch,
    },
    {
      title: "Customers",
      path: "/customer",
      id: "customer",
      icon: faUser,
    },
    {
      title: "Tickets",
      path: "/tickets",
      id: "tickets",
      icon: faTicket,
    },
    {
      title: "My Profile",
      path: "/profile",
      id: "profile",
      icon: faUser,
    },
  ],
  
};

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
      const baseRoute = path.split('/')[1];
      const currentPath = location.pathname;

      // Define route patterns for each base route
      const routePatterns = {
        'owners': [
          '/owners',
          '/create-owner',
          '/owner-details/',
          '/edit-owner/'
        ],
        'partners': [
          '/partners',
          '/create-partner',
          '/partner-details/',
          '/edit-partner/'
        ],
        'outlets': [
          '/outlets',
          '/create-outlet',
          '/view-outlet/',
          '/edit-outlet/',
          '/menus/',
          '/menu-details/',
          '/edit-menu/',
          '/categories/',
          '/category-details/',
          '/edit-category/',
        ],
        'admins': [
          '/admins',
          '/create-admin',
          '/admin-details/',
          '/edit-admin/'
        ],
        'super-owners': [
          '/super-owners',
          '/create-super-owner',
          '/super-owner-details/',
          '/edit-super-owner/'
        ],
        'qr-templates': [
          '/qr-templates',
          '/create-template',
          '/template-details/',
          '/edit-template/'
        ],
        // Special case for Access Control section
        'roles': [
          '/roles',
          '/add-role-assign-functionalities/'
        ],
        'functionalities': [
          '/functionalities',
          '/assign-functionality-role/'
        ]
      };

      // Special case for Access Control section
      if (item.title === "Access Control") {
        return Object.keys(routePatterns)
          .filter(key => ['roles', 'functionalities'].includes(key))
          .some(key => 
            routePatterns[key].some(pattern => currentPath.startsWith(pattern))
          );
      }

      // For regular menu items
      if (routePatterns[baseRoute]) {
        return routePatterns[baseRoute].some(pattern => 
          currentPath.startsWith(pattern)
        );
      }

      // Fallback for simple routes (dashboard, profile, etc.)
      return currentPath === path;
    };

    // Updated isActive logic
    const isActive = item.path 
      ? isRouteActive(item.path)
      : item.items?.some(subItem => isRouteActive(subItem.path));
    
    const hasDropdown = !!item.items;
    const isAccessControl = item.title === "Access Control";

    return (
      <li>
        {!isAccessControl ? (
          <Link
            to={item.path || "#"}
            className={`
              flex items-center gap-3 rounded-md px-4 py-2.5
              hover:bg-gray-100 dark:hover:bg-gray-800
              ${isActive ? 'bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-brand-400' : ''}
              transition-all duration-300
            `}
          >
            <FontAwesomeIcon
              icon={item.icon}
              className={`w-5 h-5 ${isActive ? 'text-brand-600 dark:text-brand-400' : ''}`}
            />
            <span className={`whitespace-nowrap ${sidebarToggle ? 'lg:hidden' : ''}`}>
              {item.title}
            </span>
            {hasDropdown && (
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`ml-auto transition-transform duration-300 ${
                  isActive ? 'rotate-180' : ''
                } ${sidebarToggle ? 'lg:hidden' : ''}`}
              />
            )}
          </Link>
        ) : (
          // Access Control section is always expanded
          <>
            <div className="menu-item group">
              <FontAwesomeIcon
                icon={item.icon}
                className={`menu-item-icon ${
                  isActive ? "menu-item-icon-active" : "menu-item-icon-inactive"
                }`}
              />

              <span
                className={`menu-item-text ${sidebarToggle ? "lg:hidden" : ""}`}
              >
                {item.title}
              </span>
            </div>

            <div className="block">
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
                        icon={subItem.icon}
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
                      icon={item.icon}
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

  // const handleLogout = async () => {
  //   try {
  //     await axios.post(
  //       'https://men4u.xyz/v2/common/logout',
  //       {
  //         user_id: adminData.user_id,
  //         role: adminData.role,
  //         app: "admin_dashboard"
  //       },
  //       {
  //         headers: {
  //           Authorization: getToken(),
  //         },
  //       }
  //     );

  //     // Clear both admin and auth data from local storage
  //     clearAdmin();
  //     logout();
      
  //     // Navigate to login page
  //     navigate('/');
      
  //   } catch (error) {
  //     console.error('Logout failed:', error);
  //     // You might want to show an error toast/notification here
  //   }
  // };

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 flex h-screen w-[290px] flex-col 
        overflow-y-auto bg-white transition-transform duration-300
        border-r border-gray-200 dark:border-gray-800 dark:bg-black
        lg:static lg:translate-x-0
        ${sidebarToggle ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarToggle ? 'lg:w-[90px]' : 'lg:w-[290px]'}
      `}
    >
      {/* Sidebar Header */}
      <div
        className={`
          flex items-center gap-2 pt-8 pb-7 px-5
          ${sidebarToggle ? 'justify-center' : 'justify-between'}
        `}
      >
          <div className="flex items-center gap-2">
            <img className="w-10" src={logo} alt="Logo" />
            <span className={`text-2xl font-semibold text-gray-900 dark:text-white ${sidebarToggle ? "lg:hidden" : ""}`}>ADMIN</span>
          </div>

      </div>

      {/* Menu Items */}
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear px-5 dark:text-white">
        <nav>
          {Object.entries(menuData).map(([groupName, items], idx) => (
            <MenuGroup key={idx} title={groupName} items={items} />
          ))}
        </nav>
      </div>

      {/* Updated Logout Button */}
      {/* <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-white border-t border-gray-200 dark:bg-black dark:border-gray-800">
        <button
          onClick={handleLogout}
          className={`w-full inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-error-500 hover:text-error-600 transition rounded-lg ${
            sidebarToggle ? "justify-center" : "justify-start"
          }`}
        >
          <FontAwesomeIcon icon={faSignOut} className="w-5 h-5" />
          <span className={`${sidebarToggle ? "lg:hidden" : ""}`}>
            Sign out
          </span>
        </button>
      </div> */}

      {/* Promo Box */}
      {/* <div
        className={`mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center 
                      dark:bg-white/[0.03] ${sidebarToggle ? "lg:hidden" : ""}`}
      >
        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
          #1 Tailwind CSS Dashboard
        </h3>
        <p className="text-theme-sm mb-4 text-gray-500 dark:text-gray-400">
          Leading Tailwind CSS Admin Template with 400+ UI Component and Pages.
        </p>
        <a
          href="https://tailadmin.com/pricing"
          target="_blank"
          rel="nofollow"
          className="bg-brand-500 text-theme-sm hover:bg-brand-600 flex items-center justify-center 
                    rounded-lg p-3 font-medium text-white"
        >
          Purchase Plan
        </a>
      </div> */}
    </aside>
  );
};

export default Sidebar;
