import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { API_CONFIG } from '../../config/appConfig';
import Breadcrumb from '../Breadcrumb';
import DataTable from '../common/DataTable';

function Notifications() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/admin/list_notifications`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (Array.isArray(response.data)) {
        const formattedNotifications = response.data.map(notification => ({
          id: notification.notification_id,
          title: notification.message,
          type: notification.type,
          outlet: notification.outlet_id === "0" ? "All" : notification.outlet_id,
          role: notification.role === "all" ? "All" : notification.role,
          user: notification.user_id === "0" ? "All" : notification.user_id,
          success_count: notification.success_count,
          failure_count: notification.failure_count,
          created_on: new Date(notification.created_on).toLocaleString(),
          broadcast_status: notification.broadcast_status
        }));
        setNotifications(formattedNotifications);
        setTotalCount(formattedNotifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const columns = [
    {
      field: 'outlet',
      header: 'Outlet',
      sortable: true,
    },
    {
      field: 'role',
      header: 'Role',
      sortable: true,
      render: (value) => (
        <span className="capitalize">{value}</span>
      ),
    },
    {
      field: 'user',
      header: 'User',
      sortable: true,
    },
    {
      field: 'title',
      header: 'Message',
      sortable: true,
      render: (value) => (
        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
          {value}
        </p>
      ),
    },
    {
      field: 'type',
      header: 'Type',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Success' ? 'bg-success-100 text-success-700' :
          value === 'Info' ? 'bg-info-100 text-info-700' :
          value === 'Warning' ? 'bg-warning-100 text-warning-700' :
          'bg-error-100 text-error-700'
        }`}>
          {value}
        </span>
      ),
    },
    {
      field: 'success_count',
      header: 'Success Count',
      sortable: true,
    },
    {
      field: 'created_on',
      header: 'Created On',
      sortable: true,
    },
  ];

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Notifications' }
  ];

  const handleBulkAction = async (action, selectedIds) => {
    console.log('Bulk action:', action, 'Selected IDs:', selectedIds);
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <DataTable
        data={notifications}
        columns={columns}
        enablePagination={true}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[10, 25, 50]}
        onItemsPerPageChange={(value) => setItemsPerPage(Number(value))}
        enableSort={true}
        enableSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        darkMode={true}
        isLoading={isLoading}
        counts={{
          total: totalCount,
          active: null,
          inactive: null
        }}
        
        enableSelection={false}
        onBulkAction={handleBulkAction}
        onSelectionChange={setSelectedItems}
        selectedItems={selectedItems}
        
        title="Notifications"
        showBackButton={true}
        showSearch={true}
        searchPlaceholder="Search"
        onBackClick={() => navigate("/dashboard")}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate("/create-notification"),
          className: "bg-success-500 hover:bg-success-600",
          position: "right"
        }}
        
        enableStatusFilter={false}
      />
    </>
  );
}

export default Notifications;