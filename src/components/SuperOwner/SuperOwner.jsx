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
  faCircleCheck,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons';
import Breadcrumb from '../Breadcrumb';
import DataTable from '../common/DataTable';
import DeleteConfirmModal from '../common/DeleteConfirmModal/DeleteConfirmModal';
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
  // Removed confirmModal state as it's not used for single delete
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
          app_source: 'admin_app'  // Required by API
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
          app_source: 'admin_app'
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
          app_source: 'admin_app',
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

  // handleBulkAction can be left as is if used by DataTable, but confirmModal logic is removed

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
  // Removed getActiveCount and getInactiveCount as they are not used in the DataTable counts

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
        onBulkAction={() => {}} // Removed bulk action as it's not used
        
        title="Super Owners"
        counts={{
          total: getTotalCount(),
          // Removed active and inactive counts from DataTable
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
        onReload={fetchSuperOwners}
      />

      <DeleteConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setOwnerToDelete(null);
        }}
        onDelete={handleDeleteOwner}
        title="Confirm Delete"
        message="Are you sure ?"
      />
    </>
  );
}

export default SuperOwner;