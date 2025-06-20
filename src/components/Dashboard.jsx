import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserTie,
  faUserGroup,
  faUsers,
  faUserGear,
  faStore,
  faEye,
  faPenToSquare,
  faCircleCheck,
  faCircleXmark
} from '@fortawesome/free-solid-svg-icons';
import DataTable from './common/DataTable';

function Dashboard() {
  const { getToken, isAuthenticated, logout } = useAuth();
  const { adminData } = useAdmin();
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

  // Add search state
  const [searchTerm, setSearchTerm] = useState('');

  // Define columns for the DataTable
  const columns = [
    {
      field: 'outlet_name',
      header: 'Outlet Name',
      sortable: true
    },
    {
      field: 'total_order_count',
      header: 'Orders',
      sortable: true
    },
    {
      field: 'total_cooking_count',
      header: 'Cooking',
      sortable: true
    },
    {
      field: 'total_placed_count',
      header: 'Placed',
      sortable: true
    },
    {
      field: 'total_paid_count',
      header: 'Paid',
      sortable: true
    },
    {
      field: 'total_cancel_count',
      header: 'Cancelled',
      sortable: true
    },
    {
      field: 'total_category',
      header: 'Categories',
      sortable: true
    },
    {
      field: 'total_menu',
      header: 'Menu Items',
      sortable: true
    },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      render: (_, item) => (
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            icon={item.total_order_count > 0 ? faCircleCheck : faCircleXmark}
            className={`w-5 h-5 ${
              item.total_order_count > 0 ? "text-success-500" : "text-error-500"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              item.total_order_count > 0 ? "text-success-700" : "text-error-700"
            }`}
          >
            {item.total_order_count > 0 ? "Active" : "Inactive"}
          </span>
        </div>
      )
    },
    {
      field: 'account_type',
      header: 'Account Type',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 text-xs ${
          value === "live"
            ? "text-error-600"
            : "text-success-600"
        }`}>
          {value?.toUpperCase()}
        </span>
      )
    },
    {
      field: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, item) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleViewClick(item)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Outlet"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleEditClick(item)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Outlet"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

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

        if (response.status === 401) {
          navigate('/');
          logout();
        }

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

      {/* Replace Table Section with DataTable */}
      <div className="mt-6">
        <DataTable 
          data={data.outlet_data || []}
          columns={columns}
          // title="All Outlets"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search outlets..."
          counts={{
            total: data.outlet_data?.length || 0,
            active: data.outlet_data?.filter(outlet => outlet.total_order_count > 0).length || 0,
            inactive: data.outlet_data?.filter(outlet => outlet.total_order_count === 0).length || 0
          }}
          showBackButton={false}
          createButton={{
            show: false
          }}
          enableSort={true}
          enablePagination={true}
          enableSearch={true}
          itemsPerPage={10}
          darkMode={false}
        />
      </div>
    </div>
  );
}

export default Dashboard;