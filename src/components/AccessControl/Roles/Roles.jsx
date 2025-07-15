import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPlus, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { useAdmin } from '../../../hooks/useAdmin';
import DataTable from '../../common/DataTable';
import Breadcrumb from '../../Breadcrumb';
import DeleteConfirmModal from '../../common/DeleteConfirmModal/DeleteConfirmModal';
import Modal from '../../common/Modal';
import { API_CONFIG } from '../../../config/appConfig';
import { toastController } from '../../../utils/toastController';

const { BASE_URL, API_VERSION } = API_CONFIG;

function Roles() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState(null);
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Access Control', path: '/dashboard' },
    { label: 'Roles', path: '/roles' }
  ];

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await toastController.promise(
        axios.get(
          `${BASE_URL}/${API_VERSION}/common/get_list/roles`,
          {
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            }
          }
        ),
        {
          loading: 'Loading roles...',
          success: 'Roles loaded successfully!',
          error: 'Failed to load roles'
        }
      );

      setRoles(response.data);
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toastController.error('Please enter a role name');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/admin/create_ubac_role`,
          { 
            role_name: newRoleName, 
            user_id: adminData.user_id, 
            app_source: "admin_app" 
          },
          {
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            }
          }
        ),
        {
          loading: 'Creating role...',
          success: 'Role created successfully!',
          error: 'Failed to create role'
        }
      );

      await fetchRoles();
      setIsModalOpen(false);
      setNewRoleName('');
    } catch (err) {
      console.error('Error creating role:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editRoleName.trim() || !editingRole) {
      toastController.error('Please enter a role name');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await toastController.promise(
        axios.put(
          `${BASE_URL}/${API_VERSION}/admin/update_ubac_role`,
          {
            role_id: editingRole.role_id,
            role_name: editRoleName,
            user_id: adminData.user_id,
            app_source: "admin_app"
          },
          {
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            }
          }
        ),
        {
          loading: 'Updating role...',
          success: 'Role updated successfully!',
          error: 'Failed to update role'
        }
      );

      await fetchRoles();
      setIsEditModalOpen(false);
      setEditingRole(null);
      setEditRoleName('');
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async () => {
    try {
      setIsSubmitting(true);
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/admin/delete_ubac_role`,
          {
            role_id: deletingRole.role_id,
            user_id: adminData.user_id,
            app_source: "admin_app"
          },
          {
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            }
          }
        ),
        {
          loading: 'Deleting role...',
          success: 'Role deleted successfully!',
          error: 'Failed to delete role'
        }
      );

      await fetchRoles();
      setIsDeleteModalOpen(false);
      setDeletingRole(null);
    } catch (err) {
      console.error('Error deleting role:', err);
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
      headerClassName: "text-center",
      render: (value) => (
        <div className="flex items-center justify-center">
          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90 capitalize">
            {value}
          </span>
        </div>
      )
    },
    {
      field: 'actions',
      header: 'Actions',
      sortable: false,
      headerClassName: "text-center",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(`/role-functionalities-mapping/${row.role_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              setEditingRole(row);
              setEditRoleName(row.role_name);
              setIsEditModalOpen(true);
            }}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Role"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setDeletingRole(row);
              setIsDeleteModalOpen(true);
            }}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Role"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
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
      <Breadcrumb items={breadcrumbItems} />

      <DataTable
        data={roles}
        columns={columns}
        title="Roles"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={null}
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
        searchPlaceholder="Search roles"
        enableSort={true}
        enablePagination={true}
        enableSearch={false}
        enableStatusFilter={false}
        showSearch={false}
        itemsPerPage={50}
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
          <div className="mb-6">
            <label 
              htmlFor="roleName" 
              className="block text-theme-sm font-medium text-left text-gray-700 mb-2"
            >
              Role Name <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              id="roleName"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-success-500 focus:border-success-500 text-gray-900"
              placeholder="Enter role name"
            />
          </div>

          <div className="flex justify-end items-center gap-3">
            <button
              onClick={handleCreateRole}
              disabled={!newRoleName.trim() || isSubmitting}
              className={`inline-flex items-center gap-2 px-4 py-2 text-theme-sm font-medium text-white rounded-full transition-colors duration-200
                ${!newRoleName.trim() || isSubmitting
                  ? 'bg-success-500 cursor-not-allowed'
                  : 'bg-success-500 hover:bg-success-600'
                }`}
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingRole(null);
          setEditRoleName('');
        }}
        title="Edit Role"
        type="default"
        size="small"
      >
        <div className="w-full">
          <div className="mb-6">
            <label 
              htmlFor="editRoleName" 
              className="block text-theme-sm font-medium text-left text-gray-700 mb-2"
            >
              Role Name <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              id="editRoleName"
              value={editRoleName}
              onChange={(e) => setEditRoleName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-warning-500 focus:border-warning-500 text-gray-900"
              placeholder="Enter role name"
            />
          </div>

          <div className="flex justify-end items-center gap-3">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingRole(null);
                setEditRoleName('');
              }}
              className="px-4 py-2 text-theme-sm font-medium text-gray-700 rounded-full border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateRole}
              disabled={!editRoleName.trim() || isSubmitting}
              className={`inline-flex items-center gap-2 px-4 py-2 text-theme-sm font-medium text-white rounded-full transition-colors duration-200
                ${!editRoleName.trim() || isSubmitting
                  ? 'bg-warning-500 cursor-not-allowed'
                  : 'bg-warning-500 hover:bg-warning-600'
                }`}
            >
              <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
              {isSubmitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </Modal>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingRole(null);
        }}
        onDelete={handleDeleteRole}
      />
    </>
  );
}

export default Roles;