import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdmin } from "../../../../hooks/useAdmin";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEye,
  faPenToSquare,
  faTrash,
  faExclamationTriangle,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from '../../../Breadcrumb';
import DataTable from '../../../common/DataTable';
import Modal from '../../../common/Modal';
import { toastController } from "../../../../utils/toastController";

function Managers() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { outletId } = useParams();
  const navigate = useNavigate();
  
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (adminData?.user_id && outletId) {
      fetchManagers();
    }
  }, [adminData?.user_id, outletId]);

  const fetchManagers = async () => {
    try {
      const response = await axios.post(
        "https://men4u.xyz/v2/common/manager_listview",
        {
          outlet_id: outletId,
          user_id: adminData.user_id,
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      setManagers(response.data.detail || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching managers:", error);
      setIsLoading(false);
    }
  };

  const handleViewManager = (user_id) => {
    navigate(`/manager-details/${outletId}/${user_id}`);
  };

  const handleEditManager = (user_id) => {
    navigate(`/edit-manager/${outletId}/${user_id}`);
  };

  const handleDeleteManager = async () => {
    try {
      await axios.delete("https://men4u.xyz/v2/common/manager_delete", {
        data: {
          update_user_id: adminData.user_id,
          outlet_id: outletId,
          user_id: managerToDelete.toString(),
        },
        headers: {
          Authorization: getToken(),
          "Content-Type": "application/json",
        },
      });

      setShowDeleteModal(false);
      setManagerToDelete(null);
      fetchManagers();
    } catch (error) {
      console.error("Error deleting manager:", error);
    }
  };

  const openDeleteModal = (user_id) => {
    setManagerToDelete(user_id);
    setShowDeleteModal(true);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Outlets', path: '/outlets' },
    { label: 'Managers' }
  ];

  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      render: (value) => (
        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
          {value}
        </p>
      ),
    },
    {
      field: "mobile",
      header: "Mobile",
      sortable: true,
    },
    {
      field: "email",
      header: "Email",
      sortable: true,
    },
    {
      field: "is_active",
      header: "Status",
      sortable: true,
      render: (value) => (
        <div className="flex items-center justify-center gap-2">
          <FontAwesomeIcon
            icon={value ? faCircleCheck : faCircleXmark}
            className={`w-5 h-5 ${
              value ? "text-success-500" : "text-error-500"
            }`}
          />
        </div>
      )
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (_, manager) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleViewManager(manager.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditManager(manager.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Manager"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(manager.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Manager"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const getTotalCount = () => managers.length;
  const getActiveCount = () => managers.filter((manager) => manager.is_active).length;
  const getInactiveCount = () => managers.filter((manager) => !manager.is_active).length;

  // Update the handleBulkAction function
  const handleBulkAction = async (action, selectedIds) => {
    try {
      const actionMessages = {
        active: {
          loading: "Activating selected managers...",
          success: "Successfully activated selected managers",
          error: "Failed to activate managers"
        },
        inactive: {
          loading: "Deactivating selected managers...",
          success: "Successfully deactivated selected managers",
          error: "Failed to deactivate managers"
        },
        delete: {
          loading: "Deleting selected managers...",
          success: "Successfully deleted selected managers",
          error: "Failed to delete managers"
        }
      };

      // Show loading toast while action is processing
      const response = await toastController.promise(
        axios.post(
          "https://men4u.xyz/v2/common/bulk_manager_action",
          {
            user_id: adminData.user_id,
            action: action,
            app_source: "admin_dashboard",
            manager_ids: selectedIds
          },
          {
            headers: {
              Authorization: getToken(),
              "Content-Type": "application/json",
            },
          }
        ),
        actionMessages[action]
      );

      // Refresh the managers list after bulk action
      fetchManagers();
      
      // Clear selected items
      setSelectedItems([]);
      
      // Show success message from API response
      toastController.success(response.data.detail);
      
    } catch (error) {
      // Show error message
      toastController.error(
        error.response?.data?.detail || 
        `Failed to perform ${action} action on selected managers`
      );
    }
  };

  // Define bulk action options
  const bulkActionOptions = [
    {
      key: "active",
      label: "Set Active",
      className: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    },
    {
      key: "inactive",
      label: "Set Inactive",
      className: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    },
    {
      key: "delete",
      label: "Delete Selected",
      className: "text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <DataTable
        data={managers}
        columns={columns}
        enablePagination={true}
        itemsPerPage={10}
        itemsPerPageOptions={[10, 20, 30, 40, 50]}
        enableSort={true}
        enableSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        darkMode={true}
        
        // Enable selection and bulk actions
        enableSelection={true}
        onSelectionChange={setSelectedItems}
        selectedItems={selectedItems}
        onBulkAction={handleBulkAction}
        bulkActionOptions={bulkActionOptions}
        
        // Header props
        title="Managers"
        counts={{
          total: getTotalCount(),
          active: getActiveCount(),
          inactive: getInactiveCount()
        }}
        showBackButton={true}
        showSearch={true}
        searchPlaceholder="Search managers..."
        onBackClick={() => navigate(-1)}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate(`/create-manager/${outletId}`),
          className: "bg-success-500 hover:bg-success-600",
          position: "right"
        }}
        
        // Add status filter props
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setManagerToDelete(null);
        }}
        title="Confirm Deletion"
        type="error"
        size="small"
        actionButtons={
          <>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setManagerToDelete(null);
              }}
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteManager}
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-error-500 px-4 py-3 font-medium text-white hover:bg-error-600"
            >
              Delete Manager
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center space-y-4">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="h-8 w-8 text-error-500"
          />
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this manager? <br/>
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </>
  );
}

export default Managers;