import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faSearch, faEye, faPlus, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import DataTable from '../../common/DataTable';
import Breadcrumb from '../../Breadcrumb';
import Modal from '../../common/Modal';

function Roles() {
  const { getToken } = useAuth();
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleCreateRole = async () => {
    try {
      setIsSubmitting(true);
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await axios.post(
        'https://men4u.xyz/v2/admin/create_ubac_role',
        { role_name: newRoleName },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh the roles list
      await fetchRoles();
      setIsModalOpen(false);
      setNewRoleName('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create role');
      console.error('Error creating role:', err);
    } finally {
      setIsSubmitting(false);
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
      field: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          {/* Updated to use roleId in the URL */}
          <button
            onClick={() => navigate(`/add-role-assign-functionalities/${row.role_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-success-500 hover:bg-success-600 rounded-lg shadow-theme-xs transition"
            title="Create Role"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
          </button>
          
          {/* Update Button */}
          <button
            onClick={() => navigate(`/edit-role/${row.role_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Update Role"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
        </div>
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
    <>
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
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => setIsModalOpen(true),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
          showIconOnly: false,
          disabled: false,
          tooltip: "Create a new role"
        }}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        searchPlaceholder="Search roles..."
        enableSort={true}
        enablePagination={false}
        enableSearch={true}
        itemsPerPage={10}
      />

      {/* Create Role Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewRoleName('');
        }}
        title="Create New Role"
        type="default"
        size="small"
      >
        <div className="w-full">
          <div className="mb-4">
            <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-2">
              Role Name
            </label>
            <input
              type="text"
              id="roleName"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter role name"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setNewRoleName('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRole}
              disabled={!newRoleName.trim() || isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg ${
                !newRoleName.trim() || isSubmitting
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Roles;