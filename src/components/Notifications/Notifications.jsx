import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../Breadcrumb';
import DataTable from '../common/DataTable';

function Notifications() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Mock data matching the screenshot
  const mockNotifications = [
    { id: 1, title: 'All', role: 'None', outlet: 'None', user: 'None', success_count: 0, failure_count: 0 },
    { id: 2, title: 'All', role: 'None', outlet: 'None', user: 'None', success_count: 0, failure_count: 0 },
    { id: 3, title: 'All', role: 'None', outlet: 'None', user: 'None', success_count: 0, failure_count: 0 },
    { id: 4, title: 'All', role: 'None', outlet: 'None', user: 'None', success_count: 0, failure_count: 0 },
    { id: 5, title: 'All', role: 'None', outlet: 'None', user: 'None', success_count: 0, failure_count: 0 },
    { id: 6, title: 'All', role: 'None', outlet: 'None', user: 'None', success_count: 0, failure_count: 0 },
    { id: 7, title: '111111', role: 'None', outlet: 'None', user: 'None', success_count: 0, failure_count: 0 },
    { id: 8, title: 'Aaaaaaaaaaaaaaaa', role: 'None', outlet: 'None', user: 'None', success_count: 0, failure_count: 0 },
    { id: 9, title: 'Cdj', role: 'None', outlet: 'None', user: 'None', success_count: 0, failure_count: 0 },
    { id: 10, title: 'Ddded', role: 'None', outlet: 'None', user: 'None', success_count: 0, failure_count: 0 }
  ];

  const columns = [
    {
      field: 'title',
      header: 'Title',
      sortable: true,
      render: (value) => (
        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
          {value}
        </p>
      ),
    },
    {
      field: 'outlet',
      header: 'Outlet',
      sortable: true,
    },
    {
      field: 'role',
      header: 'Role',
      sortable: true,
    },
    {
      field: 'user',
      header: 'User',
      sortable: true,
    },
    {
      field: 'success_count',
      header: 'Success Count',
      sortable: true,
    },
    {
      field: 'failure_count',
      header: 'Failure Count',
      sortable: true,
    },
  ];

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Notifications' }
  ];

  const handleBulkAction = async (action, selectedIds) => {
    // Implement bulk action logic here
    console.log('Bulk action:', action, 'Selected IDs:', selectedIds);
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <DataTable
        data={mockNotifications}
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
        
        // Enable selection and bulk actions
        enableSelection={true}
        onBulkAction={handleBulkAction}
        onSelectionChange={setSelectedItems}
        selectedItems={selectedItems}
        
        // Header props
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
        
        // Add status filter props
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => setStatusFilter(value)}
      />
    </>
  );
}

export default Notifications;