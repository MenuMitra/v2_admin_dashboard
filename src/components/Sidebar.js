"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  User,
  QrCode,
  Shield,
  UserCog,
  Layers,
  FileText
} from 'lucide-react';

// Shared navigation items across the application
const sidebarItems = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    href: '/dashboard',
  },
  {
    title: 'Outlets',
    icon: <ShoppingBag size={20} />,
    href: '/outlets',
  },
  {
    title: 'QR Templates',
    icon: <QrCode size={20} />,
    href: '/qr-templates',
  },
  {
    title: 'Access Control',
    icon: <Shield size={20} />,
    href: '/access-control',
    subItems: [
      // {
      //   title: 'Roles',
      //   icon: <UserCog size={18} />,
      //   href: '/access-control/roles',
      // },
      {
        title: 'Functionalities',
        icon: <Layers size={18} />,
        href: '/access-control/functionalities',
      }
    ]
  },
  {
    title: 'Owners',
    icon: <Users size={20} />,
    href: '/owners',
  },
  {
    title: 'Partners',
    icon: <Users size={20} />,
    href: '/partners',
  },
];

export default function SidebarLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const pathname = usePathname();

  // Toggle submenu expansion
  const toggleSubMenu = (href) => {
    setExpandedItems(prev => ({
      ...prev,
      [href]: !prev[href]
    }));
  };

  // Check if an item or any of its subitems is active
  const isItemActive = (item) => {
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      return true;
    }
    if (item.subItems) {
      return item.subItems.some(subItem => 
        pathname === subItem.href || pathname.startsWith(`${subItem.href}/`)
      );
    }
    return false;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform border-r border-gray-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:z-auto transition-transform duration-300 ease-in-out
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-10 h-10">
                <img 
                  src="/images/logo.png" 
                  alt="MM Outlet Management" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-900">Admin</span>
                <span className="text-xs text-gray-500">Outlet Management</span>
              </div>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              suppressHydrationWarning
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const active = isItemActive(item);
              const expanded = expandedItems[item.href] || active;
              
              return (
                <div key={item.href} className="mb-1">
                  {item.subItems ? (
                    // Parent item with subitems
                    <button
                      onClick={() => toggleSubMenu(item.href)}
                      className={`
                        flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150
                        ${active 
                          ? 'bg-gray-900 text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      suppressHydrationWarning
                    >
                      <div className="flex items-center">
                        <span className={`mr-3 ${active ? 'text-white' : 'text-gray-500'}`}>
                          {item.icon}
                        </span>
                        {item.title}
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform ${expanded ? 'transform rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  ) : (
                    // Regular link
                    <Link
                      href={item.href}
                      className={`
                        flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150
                        ${active 
                          ? 'bg-gray-900 text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      suppressHydrationWarning
                    >
                      <span className={`mr-3 ${active ? 'text-white' : 'text-gray-500'}`}>
                        {item.icon}
                      </span>
                      {item.title}
                    </Link>
                  )}
                  
                  {/* Subitems */}
                  {item.subItems && expanded && (
                    <div className="mt-1 ml-6 space-y-1">
                      {item.subItems.map((subItem) => {
                        const subActive = pathname === subItem.href || pathname.startsWith(`${subItem.href}/`);
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`
                              flex items-center px-4 py-2 text-sm rounded-md transition-colors duration-150
                              ${subActive 
                                ? 'bg-gray-100 text-gray-900 font-medium' 
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }
                            `}
                            suppressHydrationWarning
                          >
                            <span className={`mr-3 ${subActive ? 'text-gray-900' : 'text-gray-500'}`}>
                              {subItem.icon}
                            </span>
                            {subItem.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200">
            <button 
              className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-150"
              suppressHydrationWarning
            >
              <LogOut size={20} className="mr-3 text-gray-500" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white shadow-sm z-10 border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Left: Hamburger menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 focus:outline-none lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
              suppressHydrationWarning
            >
              <Menu size={24} />
            </button>

            {/* Right: User menu, notifications */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  suppressHydrationWarning
                />
              </div>

              {/* Notifications */}
              <button 
                className="p-1.5 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none relative transition-colors"
                suppressHydrationWarning
              >
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User profile */}
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 focus:outline-none"
                  suppressHydrationWarning
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                  <span className="hidden md:inline-block text-sm font-medium text-gray-700">Admin User</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
} 