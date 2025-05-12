'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FiUsers, 
  FiShoppingBag, 
  FiUserCheck,
  FiShield,
  FiSettings,
  FiActivity,
  FiGrid,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiCoffee,
  FiPackage,
  FiAlertTriangle,
  FiSearch,
  FiPhone,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiEdit,
} from 'react-icons/fi';
import dashboardService from '@/api/services/dashboardService';
import tokenService from '@/services/tokenService';

// Enhanced StatCard component
const StatCard = ({ title, value, icon: Icon, color }) => {
  if (!Icon) {
    console.error(`Icon is missing for card: ${title}`);
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200">
      <div>
        <p className="text-2xl font-semibold text-gray-900 mb-2">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className={`p-2 rounded-md ${color ? color : 'bg-gray-100'} ${color ? 'text-white' : 'text-gray-500'}`}>
            <Icon size={20} />
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
  const [dashboardData, setDashboardData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sort, setSort] = useState({ key: 'outlet_name', direction: 'asc' });
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getAdminHomeData();
      setDashboardData(response);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort outlets
  const filteredOutlets = dashboardData?.outlet_data
    ? dashboardData.outlet_data.filter(outlet => {
        const matchesSearch = outlet.outlet_name?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (selectedFilter === 'all') return matchesSearch;
        if (selectedFilter === 'active') return matchesSearch && outlet.total_order_count > 0;
        if (selectedFilter === 'inactive') return matchesSearch && outlet.total_order_count === 0;
        
        return matchesSearch;
      }).sort((a, b) => {
        const direction = sort.direction === 'asc' ? 1 : -1;
        
        if (sort.key === 'outlet_name') {
          return direction * (a.outlet_name?.localeCompare(b.outlet_name) || 0);
        } else {
          return direction * ((a[sort.key] || 0) - (b[sort.key] || 0));
        }
      })
    : [];

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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-gray-100 text-gray-800 border border-gray-200'
    }`}>
      {isActive ? (
        <>
          <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5"></span>
          Active
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-gray-400 mr-1.5"></span>
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
            {[...Array(5)].map((_, i) => (
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back!</p>
      </div>

      {/* System-wide Statistics */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard
            title="Restaurant Owners"
            value={dashboardData?.counts?.owner_count || 0}
            icon={FiUserCheck}
            color="bg-indigo-500"
          />
          <StatCard
            title="Partners"
            value={dashboardData?.counts?.partner_count || 0}
            icon={FiUsers}
            color="bg-pink-500"
          />
          <StatCard
            title="Total Outlets"
            value={dashboardData?.counts?.outlet_count || 0}
            icon={FiShoppingBag}
            color="bg-indigo-600"
          />
          <StatCard
            title="Customers"
            value={dashboardData?.counts?.customer_count || 0}
            icon={FiUsers}
            color="bg-blue-500"
          />
          <StatCard
            title="Guests"
            value={dashboardData?.counts?.guest_count || 0}
            icon={FiUsers}
            color="bg-teal-500"
          />
        </div>
      </div>

      {/* Outlet List Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Outlet Performance</h2>
          
          <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search outlets..."
                className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="pl-3 pr-8 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm bg-white"
            >
              <option value="all">All Outlets</option>
              <option value="active">Active Outlets</option>
              <option value="inactive">Inactive Outlets</option>
            </select>
          </div>
        </div>

        {!dashboardData ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
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
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <TableHeader 
                      label="Outlet Name" 
                      sortKey="outlet_name" 
                      currentSort={sort} 
                      setSort={handleSort} 
                    />
                    <TableHeader 
                      label="Orders" 
                      sortKey="total_order_count" 
                      currentSort={sort} 
                      setSort={handleSort} 
                    />
                    <TableHeader 
                      label="Cooking" 
                      sortKey="total_cooking_count" 
                      currentSort={sort} 
                      setSort={handleSort} 
                    />
                    <TableHeader 
                      label="Placed" 
                      sortKey="total_placed_count" 
                      currentSort={sort} 
                      setSort={handleSort} 
                    />
                    <TableHeader 
                      label="Paid" 
                      sortKey="total_paid_count" 
                      currentSort={sort} 
                      setSort={handleSort} 
                    />
                    <TableHeader 
                      label="Cancelled" 
                      sortKey="total_cancel_count" 
                      currentSort={sort} 
                      setSort={handleSort} 
                    />
                    <TableHeader 
                      label="Categories" 
                      sortKey="total_category" 
                      currentSort={sort} 
                      setSort={handleSort} 
                    />
                    <TableHeader 
                      label="Menu Items" 
                      sortKey="total_menu" 
                      currentSort={sort} 
                      setSort={handleSort} 
                    />
                    <th className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <div className="text-sm font-medium text-gray-900">{outlet.outlet_name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {outlet.total_order_count}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{outlet.total_cooking_count}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{outlet.total_placed_count}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{outlet.total_paid_count}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{outlet.total_cancel_count}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{outlet.total_category}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{outlet.total_menu}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge isActive={outlet.total_order_count > 0} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3 p-1 hover:bg-indigo-50 rounded-full transition-colors">
                          <FiEye size={16} />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-100 rounded-full transition-colors">
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
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
            <FiAlertTriangle size={40} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No outlets found</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `No outlets match your search: "${searchTerm}"` 
                : "No outlets available at the moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage; 