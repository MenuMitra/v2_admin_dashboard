import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../Breadcrumb';
import DataTable from '../common/DataTable';
import { useNotifications } from '../../lib/react-query/hooks/useNotifications';

const Notifications = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const {
    notifications,
    isLoadingNotifications,
    notificationsError,
    refetchNotifications,
    outlets,
    roles,
  } = useNotifications(selectedOutlet);

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
      render: (value, row) => (
        <button
          onClick={() => row.original_outlet_id !== "0" && navigate(`/view-outlet/${row.original_outlet_id}`)}
          className={`font-medium ${
            row.original_outlet_id !== "0"
              ? "text-brand-500 hover:text-brand-600 hover:underline cursor-pointer"
              : "text-gray-800 dark:text-white/90 cursor-default"
          }`}
        >
          {value}
        </button>
      ),
    },
    {
      field: 'role',
      header: 'Role',
      sortable: true,
      render: (value) => (
        <span className="capitalize font-medium text-gray-800 dark:text-white/90">
          {value}
        </span>
      ),
    },
    {
      field: 'user',
      header: 'User',
      sortable: true,
      render: (value, row) => (
        <button
          onClick={() => row.original_user_id !== "0" && navigate(`/owner-details/${row.original_user_id}`)}
          className={`font-medium ${
            row.original_user_id !== "0"
              ? "text-brand-500 hover:text-brand-600 hover:underline cursor-pointer"
              : "text-gray-800 dark:text-white/90 cursor-default"
          }`}
        >
          {value}
        </button>
      ),
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
      header: 'Success',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-success-600">
          {value}
        </span>
      ),
    },
    {
      field: 'created_on',
      header: 'Sent On',
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        hours = hours.toString().padStart(2, '0');
        const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds} ${ampm}`;
        
        return (
          <span className="font-medium text-gray-800 dark:text-white/90">
            {formattedDate}
          </span>
        );
      },
    },
  ];

  const breadcrumbItems = [
    { label: 'Home', path: '/home' },
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
        isLoading={isLoadingNotifications}
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
        onReload={refetchNotifications}
        error={notificationsError}
      />
    </>
  );
};

export default Notifications; 