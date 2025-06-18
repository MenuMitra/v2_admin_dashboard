import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPenToSquare, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import DataTable from '../common/DataTable';
import Breadcrumb from '../Breadcrumb';

function Admins() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Format date helper function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  // Add this breadcrumb items configuration
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Admins', path: '/admins' }
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        'https://men4u.xyz/v2/admin/list_admins',
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'success') {
        setAdmins(response.data.data);
      } else {
        throw new Error('Failed to fetch admins');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch admins');
      console.error('Error fetching admins:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Define columns for DataTable
  const columns = [
    {
      field: 'name',
      header: 'Name',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">
          {value}
        </span>
      )
    },
    {
      field: 'email',
      header: 'Email',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      field: 'mobile',
      header: 'Mobile',
      sortable: true
    },
    {
      field: 'is_active',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      field: 'created_on',
      header: 'Created On',
      sortable: true,
      render: (value) => formatDate(value)
    },
    {
      field: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, admin) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(`/admin-details/${admin.user_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/edit-admin/${admin.user_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Admin"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteAdmin(admin)}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Admin"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const handleDeleteAdmin = (admin) => {
    // Implement delete functionality here
    console.log('Delete admin:', admin);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate counts
  const activesCount = admins.filter(admin => admin.is_active).length;
  const inactivesCount = admins.filter(admin => !admin.is_active).length;

  return (
    <div className="p-6">
      <Breadcrumb items={breadcrumbItems} />

      {error && (
        <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <DataTable
        data={admins}
        columns={columns}
        title="Admins"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={{
          total: admins.length,
          active: activesCount,
          inactive: inactivesCount
        }}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate('/create-admin'),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
          showIconOnly: false,
          disabled: false,
          tooltip: "Create a new admin"
        }}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        searchPlaceholder="Search admins..."
        enableSort={true}
        enablePagination={true}
        enableSearch={true}
        itemsPerPage={10}
      />
    </div>
  );
}

export default Admins;