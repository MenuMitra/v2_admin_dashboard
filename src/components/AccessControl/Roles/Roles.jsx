import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faSearch, faEye, faPlus, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import DataTable from '../../common/DataTable';
import Breadcrumb from '../../Breadcrumb';

function Roles() {
  const { getToken } = useAuth();
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Add this breadcrumb items configuration
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Access Control', path: '/dashboard' },
    { label: 'Roles', path: '/roles' }
  ];

  // Process roles data to group by role
  const processRolesData = (data) => {
    const roleMap = data.reduce((acc, item) => {
      if (!acc[item.role_name]) {
        acc[item.role_name] = {
          role_id: item.role_id,
          role_name: item.role_name,
          functionalities: [],
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
    // {
    //   field: 'actions',
    //   header: 'Actions',
    //   sortable: false,
    //   render: () => (
    //     <div className="flex items-center justify-center gap-2">
    //       <button
    //         className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
    //         title="View Details"
    //       >
    //         <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
    //       </button>
    //     </div>
    //   )
    // }
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
      {/* Replace the manual breadcrumb with */}
      <Breadcrumb items={breadcrumbItems} />

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
          active: roles.length,
          inactive: 0
        }}
        createButton={{show:false}}
        
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        searchPlaceholder="Search roles..."
        enableSort={true}
        enablePagination={false}
        enableSearch={true}
        itemsPerPage={10}
      />
    </div>
  );
}

export default Roles;