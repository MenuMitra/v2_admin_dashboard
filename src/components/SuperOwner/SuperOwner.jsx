import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus,
  faEye,
  faPenToSquare,
  faTrash,
  faUserShield
} from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../Breadcrumb';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';

function SuperOwner() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [superOwners, setSuperOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);

  useEffect(() => {
    fetchSuperOwners();
  }, []);

  const fetchSuperOwners = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/admin/listview_super_owner',
        {
          app_source: 'admin_dashboard'
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.super_owners) {
        setSuperOwners(response.data.super_owners);
      }
    } catch (error) {
      console.error('Error fetching super owners:', error);
      setError('Failed to fetch super owners list');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (superOwnerId) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/admin/view_super_owner',
        {
          user_id: 1,
          super_owner_id: superOwnerId,
          app_source: 'admin_dashboard'
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.super_owner) {
        navigate(`/super-owner-details/${superOwnerId}`, { 
          state: { 
            superOwnerData: response.data.super_owner,
            assignedOutlets: response.data.assigned_outlets,
            assignedFunctionalities: response.data.assigned_functionalities,
            totalOutlets: response.data.total_outlets,
            totalFunctionalities: response.data.total_functionalities
          } 
        });
      }
    } catch (error) {
      console.error('Error fetching super owner details:', error);
      setError('Failed to fetch super owner details');
    }
  };

  const handleEditOwner = (superOwnerId) => {
    navigate(`/edit-super-owner/${superOwnerId}`);
  };

  const openDeleteModal = (superOwnerId) => {
    setOwnerToDelete(superOwnerId);
    setShowDeleteModal(true);
  };

  const handleDeleteOwner = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await axios.delete('https://men4u.xyz/v2/admin/delete_super_owner', {
        data: {
          super_owner_id: ownerToDelete,
          app_source: 'admin_dashboard'
        },
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      setShowDeleteModal(false);
      setOwnerToDelete(null);
      fetchSuperOwners(); // Refresh the list
    } catch (error) {
      console.error('Error deleting super owner:', error);
      setError('Failed to delete super owner');
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Super Owners', path: '/super-owners' }
  ];

  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      headerClassName: "text-center",
      render: (value) => (
        <div className="flex items-center justify-center gap-3">
          <div>
            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
              {value}
            </p>
          </div>
        </div>
      ),
    },
    {
      field: "email",
      header: "Email",
      sortable: true,
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      field: "mobile",
      header: "Mobile",
      sortable: true,
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      field: "is_active",
      header: "Status",
      sortable: true,
      headerClassName: "text-center",
      render: (value) => (
        <div className="flex justify-center">
          <span className={`inline-block px-3 py-1 rounded-full text-xs ${
            value ? 'bg-success-100 text-success-600' : 'bg-error-100 text-error-500'
          }`}>
            {value ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      headerClassName: "text-center",
      render: (_, owner) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleViewDetails(owner.super_owner_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditOwner(owner.super_owner_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Super Owner"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(owner.super_owner_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Super Owner"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const getTotalCount = () => superOwners.length;
  const getActiveCount = () => superOwners.filter(owner => owner.is_active).length;
  const getInactiveCount = () => superOwners.filter(owner => !owner.is_active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb items={breadcrumbItems} />
      <DataTable
        data={superOwners}
        columns={columns}
        itemsPerPage={10}
        enableSort={true}
        enablePagination={true}
        enableSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        darkMode={true}
        
        enableSelection={true}
        onSelectionChange={setSelectedItems}
        selectedItems={selectedItems}
        
        title="Super Owners"
        counts={{
          total: getTotalCount(),
          active: getActiveCount(),
          inactive: getInactiveCount()
        }}
        showBackButton={true}
        showSearch={true}
        searchPlaceholder="Search super owners..."
        onBackClick={() => navigate("/")}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate("/create-super-owner"),
          className: "bg-success-500 hover:bg-success-600",
          position: "right"
        }}
        error={error}
      />

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setOwnerToDelete(null);
        }}
        title="Confirm Deletion"
        type="error"
        size="small"
        customIcon={
          <FontAwesomeIcon
            icon={faTrash}
            className="h-6 w-6 text-error-500"
          />
        }
        actionButtons={
          <>
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setOwnerToDelete(null);
              }}
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteOwner}
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-error-500 px-4 py-3 font-medium text-white hover:bg-error-600"
            >
              Delete Super Owner
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Are you sure you want to delete this super owner? This action
          cannot be undone. 
          <br/>All data associated with this super owner
          will be permanently removed.
        </p>
      </Modal>
    </div>
  );
}

export default SuperOwner;