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
  faUserShield,
  faXmark,
  faCheck,
  faCircleCheck,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../Breadcrumb';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import { useAdmin } from '../../hooks/useAdmin';

function SuperOwner() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const [superOwners, setSuperOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
    title: '',
    message: ''
  });
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSuperOwners();
  }, []);

  // ---------------------------------------------------------------------------
  // Data normalisation for the generic <DataTable/>
  //
  // • The reusable DataTable component identifies (and therefore selects /
  //   toggles) each row by the value of a property named `user_id`.
  //
  // • The "listview_super_owner" API, however, returns the primary key for each
  //   record as `super_owner_id`.
  //
  // • If we pass the raw API response directly to DataTable the `user_id`
  //   field is missing, so every row appears to have the same identifier
  //   (undefined).  When you tick any checkbox the table thinks you are
  //   selecting the same row repeatedly and ends up toggling ALL rows at once.
  //
  // • To avoid changing the DataTable (or every other screen that already uses
  //   it) we add a tiny mapping layer here: for every super-owner record we
  //   copy its `super_owner_id` into a new `user_id` property.  The original
  //   `super_owner_id` remains intact for view / edit / delete handlers.
  // ---------------------------------------------------------------------------
  const normaliseData = (owners) =>
    owners.map((owner) => ({
      ...owner,
      user_id: owner.super_owner_id,   // Add user_id for DataTable selection
    }));

  // Fetch super owners list from API
  const fetchSuperOwners = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Call the super owner list API
      const response = await axios.post(
        'https://men4u.xyz/v2/admin/listview_super_owner',
        { 
          app_source: 'admin_dashboard'  // Required by API
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      // Process response and update state
      if (response.data?.super_owners) {
        // Normalize data to add user_id before setting state
        setSuperOwners(normaliseData(response.data.super_owners));
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
          user_id: adminData?.user_id,
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
          app_source: 'admin_dashboard',
          user_id: adminData?.user_id
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

  const getConfirmationDetails = (action) => {
    switch(action) {
      case 'active':
        return {
          title: 'Confirm Activation',
          message: `Are you sure you want to activate ${selectedItems.length} selected super owner(s)?`
        };
      case 'inactive':
        return {
          title: 'Confirm Deactivation',
          message: `Are you sure you want to deactivate ${selectedItems.length} selected super owner(s)?`
        };
      case 'delete':
        return {
          title: 'Confirm Deletion',
          message: `Are you sure you want to delete ${selectedItems.length} selected super owner(s)? This action cannot be undone.`
        };
      default:
        return { title: '', message: '' };
    }
  };

  const handleBulkAction = async (action, selectedIds) => {
    try {
      const { title, message } = getConfirmationDetails(action);
      setConfirmModal({
        isOpen: true,
        action,
        title,
        message
      });
    } catch (error) {
      console.error('Error in bulk action:', error);
      setError('Failed to perform bulk action');
    }
  };

  const executeBulkAction = async (action) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const validSuperOwnerIds = selectedItems.filter(id => id !== null && id !== undefined);

      if (validSuperOwnerIds.length === 0) {
        throw new Error('No valid super owner IDs selected');
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/common/bulk_super_owner_action',
        {
          user_id: adminData.user_id,
          action: action,
          app_source: "admin_dashboard",
          super_owner_ids: validSuperOwnerIds
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        // Clear selections
        setSelectedItems([]); // Clear local state
        setConfirmModal({ isOpen: false, action: null, title: '', message: '' });
        
        // Refresh data
        await fetchSuperOwners();
      }
    } catch (error) {
      console.error('Error executing bulk action:', error);
      setError(error.response?.data?.detail || `Failed to ${action} super owners`);
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
      field: "outlet_ids",
      header: "Outlets",
      sortable: true,
      headerClassName: "text-center",
      render: (value) => (
        <div className="flex items-center justify-center">
          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
            {Array.isArray(value) ? value.length : 0}
          </span>
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
        <div className="flex items-center justify-center gap-2">
          <FontAwesomeIcon
            icon={value ? faCircleCheck : faCircleXmark}
            className={`w-5 h-5 ${
              value ? "text-success-500" : "text-error-500"
            }`}
          />
          <span
            className={`text-base font-medium ${
              value ? "text-success-700" : "text-error-700"
            }`}
          >
            {value ? "Active" : "Inactive"}
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
    <>
      <Breadcrumb items={breadcrumbItems} />
      <DataTable
        data={superOwners.filter(owner => {
          if (statusFilter === 'all') return true;
          const isActive = owner.is_active === true;
          return statusFilter === 'active' ? isActive : !isActive;
        })}
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
        onBulkAction={handleBulkAction}
        
        title="Super Owners"
        counts={{
          total: getTotalCount(),
          active: superOwners.filter(owner => owner.is_active === true).length,
          inactive: superOwners.filter(owner => owner.is_active === false).length
        }}
        showBackButton={true}
        showSearch={true}
        searchPlaceholder="Search"
        onBackClick={() => navigate(-1)}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate("/create-super-owner"),
          className: "bg-success-500 hover:bg-success-600",
          position: "right"
        }}
        error={error}
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
        }}
      />

      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null, title: '', message: '' })}
        title={confirmModal.title}
        type={confirmModal.action === 'delete' ? 'error' : 'warning'}
        size="small"
      >
        <p className="mb-6">{confirmModal.message}</p>
        <div className="flex justify-between items-center w-full gap-3">
          <button
            onClick={() => setConfirmModal({ isOpen: false, action: null, title: '', message: '' })}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={() => executeBulkAction(confirmModal.action)}
            className={`px-4 py-2 text-sm font-medium text-white rounded-full transition ${
              confirmModal.action === 'delete' 
                ? 'bg-error-500 hover:bg-error-600' 
                : 'bg-warning-500 hover:bg-warning-600'
            }`}
          >
            <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
            Confirm
          </button>
        </div>
      </Modal>

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
    </>
  );
}

export default SuperOwner;