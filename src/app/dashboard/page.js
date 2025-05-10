'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FiUsers, 
  FiShoppingBag, 
  FiDollarSign, 
  FiTrendingUp,
  FiUserCheck,
  FiShield,
  FiSettings,
  FiActivity,
  FiGrid,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiList,
  FiMenu,
  FiCoffee,
  FiPackage,
  FiBarChart2,
  FiAlertTriangle,
  FiSearch,
  FiMap,
  FiMapPin,
  FiPhone,
  FiFileText,
  FiCalendar,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiEdit,
  FiArrowRight,
  FiMoreHorizontal
} from 'react-icons/fi';
import dashboardService from '@/api/services/dashboardService';
import outletService from '@/api/services/outletService';
import tokenService from '@/services/tokenService';

// Enhanced StatCard component
const StatCard = ({ title, value, growth, icon: Icon, color }) => {
  if (!Icon) {
    console.error(`Icon is missing for card: ${title}`);
    return null;
  }
  
  return (
    <div className="bg-white rounded shadow-sm p-5 border border-gray-200 hover:border-gray-300 transition-all">
      <div>
        <p className="text-2xl font-semibold text-gray-900 mb-2">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <div className="flex items-center">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className={`p-1 rounded-md ${color ? color : 'bg-gray-100'} ${color ? 'text-white' : 'text-gray-500'} ml-2`}>
            <Icon size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Table header component
const TableHeader = ({ label, sortKey, currentSort, setSort }) => {
  const isSorted = currentSort.key === sortKey;
  const isAsc = isSorted && currentSort.direction === 'asc';

  return (
    <th 
      className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => setSort(sortKey)}
    >
      <div className="flex items-center">
        <span>{label}</span>
        <span className="ml-1 text-gray-400">
          {isSorted ? (
            isAsc ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
          ) : (
            <FiChevronDown size={14} className="opacity-40" />
          )}
        </span>
      </div>
    </th>
  );
};

// Dashboard component
function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [outletLoading, setOutletLoading] = useState(true);
  const [outlets, setOutlets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sort, setSort] = useState({ key: 'name', direction: 'asc' });
  
  const [stats, setStats] = useState({
    users: { total: 0, growth: 0 },
    outlets: { total: 0, growth: 0 },
    revenue: { total: 0, growth: 0 },
    sessions: { total: 0, growth: 0 },
    owners: { total: 0, growth: 0 },
    partners: { total: 0, growth: 0 },
    roles: { total: 0, growth: 0 },
    functionalities: { total: 0, growth: 0 },
    qrTemplates: { total: 0, growth: 0 }
  });

  useEffect(() => {
    fetchDashboardData();
    fetchOutlets();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsResponse = await dashboardService.getStats();
      
      // Process and organize stats data
      setStats({
        users: {
          total: statsResponse.total_users || 0,
          growth: statsResponse.user_growth || 0
        },
        outlets: {
          total: statsResponse.total_outlets || 0,
          growth: statsResponse.outlet_growth || 0
        },
        revenue: {
          total: statsResponse.total_revenue || 0,
          growth: statsResponse.revenue_growth || 0
        },
        sessions: {
          total: statsResponse.active_sessions || 0,
          growth: statsResponse.session_growth || 0
        },
        owners: {
          total: statsResponse.total_owners || 0,
          growth: statsResponse.owner_growth || 0
        },
        partners: {
          total: statsResponse.total_partners || 0,
          growth: statsResponse.partner_growth || 0
        },
        roles: {
          total: statsResponse.total_roles || 0,
          growth: statsResponse.role_growth || 0
        },
        functionalities: {
          total: statsResponse.total_functionalities || 0,
          growth: statsResponse.functionality_growth || 0
        },
        qrTemplates: {
          total: statsResponse.total_qr_templates || 0,
          growth: statsResponse.qr_template_growth || 0
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOutlets = async () => {
    setOutletLoading(true);
    try {
      const userData = tokenService.getUserData();
      const userId = userData?.id || 1;
      
      const response = await outletService.listOutlets(userId);
      
      // Add mock order data for demonstration
      const outletsWithOrderData = Array.isArray(response) ? response.map(outlet => ({
        ...outlet,
        cooking_orders: Math.floor(Math.random() * 10),
        placed_orders: Math.floor(Math.random() * 20) + 5,
        paid_orders: Math.floor(Math.random() * 50) + 20,
        cancelled_orders: Math.floor(Math.random() * 8),
        categories: Math.floor(Math.random() * 10) + 5,
        menu_items: Math.floor(Math.random() * 50) + 15,
        revenue: Math.floor(Math.random() * 5000) + 1000,
        todays_orders: Math.floor(Math.random() * 30) + 5,
        total_orders: function() {
          return this.cooking_orders + this.placed_orders + this.paid_orders + this.cancelled_orders;
        }
      })) : [];
      
      // Add a mock outlet for demonstration
      if (!outletsWithOrderData.length) {
        outletsWithOrderData.push({
          outlet_id: 99,
          name: "Italian Bistro",
          address: "123 Main Street, New York, NY 10001",
          is_active: true,
          cooking_orders: 4,
          placed_orders: 12,
          paid_orders: 35,
          cancelled_orders: 3,
          categories: 8,
          menu_items: 42,
          revenue: 3850,
          todays_orders: 18,
          phone: "+1 (555) 123-4567",
          total_orders: function() {
            return this.cooking_orders + this.placed_orders + this.paid_orders + this.cancelled_orders;
          }
        });
      }
      
      setOutlets(outletsWithOrderData);
    } catch (error) {
      console.error('Error fetching outlets:', error);
      toast.error('Failed to load outlets');
      
      // Add a mock outlet in case of error
      setOutlets([{
        outlet_id: 99,
        name: "Italian Bistro",
        address: "123 Main Street, New York, NY 10001",
        is_active: true,
        cooking_orders: 4,
        placed_orders: 12,
        paid_orders: 35,
        cancelled_orders: 3,
        categories: 8,
        menu_items: 42,
        revenue: 3850,
        todays_orders: 18,
        phone: "+1 (555) 123-4567",
        total_orders: function() {
          return this.cooking_orders + this.placed_orders + this.paid_orders + this.cancelled_orders;
        }
      }]);
    } finally {
      setOutletLoading(false);
    }
  };

  const filteredOutlets = outlets.filter(outlet => {
    const matchesSearch = outlet.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (outlet.address && outlet.address.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'active') return matchesSearch && outlet.is_active;
    if (selectedFilter === 'inactive') return matchesSearch && !outlet.is_active;
    
    return matchesSearch;
  }).sort((a, b) => {
    const direction = sort.direction === 'asc' ? 1 : -1;
    
    // Handle different field types appropriately
    if (sort.key === 'name') {
      return direction * (a.name?.localeCompare(b.name) || 0);
    } else if (sort.key === 'total_orders') {
      return direction * ((a.total_orders() || 0) - (b.total_orders() || 0));
    } else if (typeof a[sort.key] === 'function') {
      return direction * ((a[sort.key]() || 0) - (b[sort.key]() || 0));
    } else {
      return direction * ((a[sort.key] || 0) - (b[sort.key] || 0));
    }
  });

  const handleSort = (key) => {
    if (sort.key === key) {
      setSort({
        key,
        direction: sort.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSort({
        key,
        direction: 'asc'
      });
    }
  };

  // Status badge component
  const StatusBadge = ({ isActive }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-100 text-green-800' 
        : 'bg-gray-100 text-gray-800'
    }`}>
      {isActive ? (
        <>
          <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
          Active
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-gray-400 mr-1"></span>
          Inactive
        </>
      )}
    </span>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded shadow-sm p-5 border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 bg-gray-200 rounded mr-3"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
            <div className="h-12 bg-gray-100 w-full"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-t border-gray-200">
                <div className="h-16 px-4 py-3 flex items-center">
                  <div className="h-5 bg-gray-200 rounded w-1/6 mr-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/6 mr-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/6 mr-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/6 mr-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/6 mr-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back!</p>
      </div>

      {/* System-wide Statistics - Only show non-outlet specific metrics */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard
            title="Restaurant Owners"
            value={stats.owners.total}
            growth={stats.owners.growth}
            icon={FiUserCheck}
            color="bg-indigo-500"
          />
          <StatCard
            title="Partners"
            value={stats.partners.total}
            growth={stats.partners.growth}
            icon={FiUsers}
            color="bg-pink-500"
          />
          <StatCard
            title="Total Outlets"
            value={stats.outlets.total}
            growth={stats.outlets.growth}
            icon={FiShoppingBag}
            color="bg-indigo-600"
          />
          <StatCard
            title="QR Templates"
            value={stats.qrTemplates.total}
            growth={stats.qrTemplates.growth}
            icon={FiGrid}
            color="bg-teal-500"
          />
          <StatCard
            title="Total Users"
            value={stats.users.total}
            growth={stats.users.growth}
            icon={FiUsers}
            color="bg-blue-500"
          />
          <StatCard
            title="Functionalities"
            value={stats.functionalities.total}
            growth={stats.functionalities.growth}
            icon={FiSettings}
            color="bg-gray-600"
          />
        </div>
      </div>

      {/* Outlet List Section - Now with a table layout */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Outlet Performance</h2>
          
          <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search outlets..."
                className="w-full sm:w-64 pl-9 pr-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="pl-3 pr-8 py-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm bg-white"
            >
              <option value="all">All Outlets</option>
              <option value="active">Active Outlets</option>
              <option value="inactive">Inactive Outlets</option>
            </select>
          </div>
        </div>

        {outletLoading ? (
          <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
            <div className="h-12 bg-gray-100 w-full"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-t border-gray-200">
                <div className="h-16 px-4 py-3 flex items-center">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-1/6 mr-4"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-1/6 mr-4"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-1/6 mr-4"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-1/6 mr-4"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-1/6 mr-4"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-1/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOutlets.length > 0 ? (
          <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <TableHeader 
                      label="Outlet Name" 
                      sortKey="name" 
                      currentSort={sort} 
                      setSort={handleSort} 
                    />
                    <TableHeader 
                      label="Orders" 
                      sortKey="total_orders" 
                      currentSort={sort} 
                      setSort={handleSort} 
                    />
                    <TableHeader 
                      label="Cooking" 
                      sortKey="cooking_orders" 
                      currentSort={sort} 
                      setSort={handleSort} 
                    />
                    <TableHeader 
                      label="Placed" 
                      sortKey="placed_orders" 
                      currentSort={sort} 
                      setSort={handleSort} 
                    />
                    <TableHeader 
                      label="Paid" 
                      sortKey="paid_orders" 
                      currentSort={sort} 
                      setSort={handleSort} 
                    />
                    <TableHeader 
                      label="Cancelled" 
                      sortKey="cancelled_orders" 
                      currentSort={sort} 
                      setSort={handleSort} 
                    />
                    <TableHeader 
                      label="Categories" 
                      sortKey="categories" 
                      currentSort={sort} 
                      setSort={handleSort} 
                    />
                    <TableHeader 
                      label="Menu" 
                      sortKey="menu_items" 
                      currentSort={sort} 
                      setSort={handleSort} 
                    />
                    <TableHeader 
                      label="Revenue" 
                      sortKey="revenue" 
                      currentSort={sort} 
                      setSort={handleSort} 
                    />
                    <th className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 border-b border-gray-200 bg-gray-50"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOutlets.map((outlet) => (
                    <tr 
                      key={outlet.outlet_id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{outlet.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {outlet.address}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {typeof outlet.total_orders === 'function' ? outlet.total_orders() : (outlet.cooking_orders + outlet.placed_orders + outlet.paid_orders + outlet.cancelled_orders)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{outlet.cooking_orders}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{outlet.placed_orders}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{outlet.paid_orders}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{outlet.cancelled_orders}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{outlet.categories}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{outlet.menu_items}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-900">
                          ${outlet.revenue.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge isActive={outlet.is_active} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                          <FiEye size={16} />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <FiEdit size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded shadow-sm border border-gray-200 p-8 text-center">
            <FiAlertTriangle size={40} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No outlets found</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `No outlets match your search: "${searchTerm}"` 
                : "You don't have any outlets yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 

export default DashboardPage; 