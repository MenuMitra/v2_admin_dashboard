import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { API_CONFIG } from '../../config/appConfig';
import Breadcrumb from '../Breadcrumb';
import DataTable from '../common/DataTable';

const Notifications = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');

  const fetchOutlets = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/common/get_list/outlets`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data.detail === "Successfully retrieved outlets") {
        const formattedOutlets = Object.entries(response.data.outlet_list).map(([name, id]) => ({
          outlet_id: id.toString(),
          outlet_name: name,
          outlet_code: id.toString()
        }));
        setOutlets(formattedOutlets);
      }
    } catch (error) {
      console.error('Error fetching outlets:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/notification_filter_options`,
        { outlet_id: selectedOutlet || "0" },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data.roles) {
        const formattedRoles = response.data.roles.map(role => ({
          role_id: role.role,
          role_name: role.role.charAt(0).toUpperCase() + role.role.slice(1).replace('_', ' '),
          count: role.count
        }));
        setRoles(formattedRoles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

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
          broadcast_status: notification.broadcast_status,
          // Store original values for filtering
          original_outlet_id: notification.outlet_id,
          original_role: notification.role
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
    fetchOutlets();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (selectedOutlet) {
      fetchRoles();
    } else {
      setRoles([]);
      setSelectedRole('');
    }
  }, [selectedOutlet]);

  const handleOutletChange = (value) => {
    setSelectedOutlet(value);
    setSelectedRole(''); // Reset role when outlet changes
  };

  const handleRoleChange = (value) => {
    setSelectedRole(value);
  };

  // Filter notifications based on selected outlet and role
  const getFilteredNotifications = () => {
    return notifications.filter(notification => {
      const matchesOutlet = !selectedOutlet || 
        notification.original_outlet_id === "0" || // Include "All" outlets
        notification.original_outlet_id === selectedOutlet; // Match specific outlet

      const matchesRole = !selectedRole || 
        notification.original_role === "all" || // Include "All" roles
        notification.original_role === selectedRole; // Match specific role

      return matchesOutlet && matchesRole;
    });
  };

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

  // Get filtered notifications
  const filteredNotifications = getFilteredNotifications();

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <DataTable
        data={filteredNotifications}
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
          total: filteredNotifications.length,
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
        showOutletSelect={true}
        outlets={outlets}
        selectedOutlet={selectedOutlet}
        onOutletChange={handleOutletChange}
        
        showRoleSelect={true}
        roles={roles}
        selectedRole={selectedRole}
        onRoleChange={handleRoleChange}
      />
    </>
  );
};

export default Notifications;