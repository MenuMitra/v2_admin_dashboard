import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserTie,
  faUserGroup,
  faUsers,
  faUserGear,
  faStore,
  faEye,
  faPenToSquare
} from '@fortawesome/free-solid-svg-icons';

function Dashboard() {
  const { getToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    outlet_data: [],
    counts: {
      customer_count: 0,
      owner_count: 0,
      outlet_count: 0,
      partner_count: 0,
      guest_count: 0
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = getToken();
        if (!token) {
          throw new Error('No authentication token available');
        }

        const response = await fetch('https://men4u.xyz/v2/admin/admin_home', {
          method: 'GET',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    if (isAuthenticated()) {
      fetchDashboardData();
    }
  }, []);

  const handleEditClick = (outlet) => {
    navigate(`/edit-outlet/${outlet.outlet_id}`);
  };

  const handleViewClick = (outlet) => {
    navigate(`/view-outlet/${outlet.outlet_id}`);
  };

  return (
    <div className="p-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                <FontAwesomeIcon icon={faUserTie} className="h-6 w-6 text-brand-500 dark:text-brand-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                  {data.counts?.owner_count || 0}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Restaurant Owners</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                <FontAwesomeIcon icon={faUserGroup} className="h-6 w-6 text-brand-500 dark:text-brand-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                  {data.counts?.partner_count || 0}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Partners</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                <FontAwesomeIcon icon={faStore} className="h-6 w-6 text-brand-500 dark:text-brand-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                  {data.counts?.outlet_count || 0}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Outlets</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                <FontAwesomeIcon icon={faUsers} className="h-6 w-6 text-brand-500 dark:text-brand-400" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                  {data.counts?.customer_count || 0}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing 1 to {data.outlet_data?.length} of {data.outlet_data?.length} entries
          </span>
          <div className="flex items-center gap-2">
            <span className="text-gray-700 dark:text-gray-300">All Outlets</span>
            <input 
              type="text" 
              placeholder="Search outlets..." 
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Outlet Name</th>
                <th className="px-6 py-3">Orders</th>
                <th className="px-6 py-3">Cooking</th>
                <th className="px-6 py-3">Placed</th>
                <th className="px-6 py-3">Paid</th>
                <th className="px-6 py-3">Cancelled</th>
                <th className="px-6 py-3">Categories</th>
                <th className="px-6 py-3">Menu Items</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Account Type</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {data.outlet_data?.map((outlet) => (
                <tr key={outlet.outlet_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4">{outlet.outlet_name}</td>
                  <td className="px-6 py-4">{outlet.total_order_count}</td>
                  <td className="px-6 py-4">{outlet.total_cooking_count}</td>
                  <td className="px-6 py-4">{outlet.total_placed_count}</td>
                  <td className="px-6 py-4">{outlet.total_paid_count}</td>
                  <td className="px-6 py-4">{outlet.total_cancel_count}</td>
                  <td className="px-6 py-4">{outlet.total_category}</td>
                  <td className="px-6 py-4">{outlet.total_menu}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${outlet.total_order_count > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {outlet.total_order_count > 0 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${outlet.account_type === 'test' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                      {outlet.account_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditClick(outlet)}
                        className="p-2 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg"
                        title="Edit Outlet"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleViewClick(outlet)}
                        className="p-2 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg"
                        title="View Outlet"
                      >
                        <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;