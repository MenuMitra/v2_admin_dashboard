import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faSearch, faEye } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import DataTable from '../../common/DataTable';

function Roles() {
  const { getToken } = useAuth();
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Process roles data to group by role
  const processRolesData = (data) => {
    const roleMap = data.reduce((acc, item) => {
      if (!acc[item.role_name]) {
        acc[item.role_name] = {
          role_id: item.role_id,
          role_name: item.role_name,
          functionalities: [],
          created_on: 'Jun 13, 2025' // Hardcoded for now, update if API provides this
        };
      }
      acc[item.role_name].functionalities.push({
        id: item.functionality_id,
        name: item.functionality_name
      });
      return acc;
    }, {});
    return Object.values(roleMap);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        'https://men4u.xyz/v2/admin/get_ubac_role_functionality_mappings',
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      const processedRoles = processRolesData(response.data);
      setRoles(processedRoles);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch roles');
      console.error('Error fetching roles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Define columns for DataTable
  const columns = [
    {
      field: 'role_name',
      header: 'Role',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900 capitalize">{value}</span>
      )
    },
    {
      field: 'functionalities',
      header: 'Functionalities',
      sortable: true,
      render: (functionalities) => `${functionalities.length} assigned`
    },
    {
      field: 'created_on',
      header: 'Created On',
      sortable: true
    },
    {
      field: 'actions',
      header: 'Actions',
      sortable: false,
      render: () => (
        <button
          className="text-blue-500 hover:text-blue-600 transition-colors"
          title="View Details"
        >
          <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
        </button>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">Dashboard</Link>
        <span className="text-gray-500">/</span>
        <Link to="/access-control" className="text-gray-500 hover:text-gray-700">Access-control</Link>
        <span className="text-gray-500">/</span>
        <span className="text-gray-700">Roles</span>
      </div>

   

      {error && (
        <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <DataTable
        data={roles}
        columns={columns}
        title="Roles"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={{
          total: roles.length,
          active: roles.length, // Update these with actual counts if available
          inactive: 0
        }}
        createButton={{
          label: "Create Role",
          onClick: () => {/* Add your create role handler */},
          className: "bg-brand-500 hover:bg-brand-600",
          position: "right"
        }}
        searchPlaceholder="Search roles..."
        enableSort={true}
        enablePagination={true}
        enableSearch={true}
        itemsPerPage={10}
      />
    </div>
  );
}

export default Roles;