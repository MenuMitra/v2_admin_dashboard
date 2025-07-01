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
import { API_CONFIG } from "../../../../config/appConfig";

function Chefs() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { outletId } = useParams();
  const navigate = useNavigate();
  const {BASE_URL, API_VERSION} = API_CONFIG;
  const [chefs, setChefs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chefToDelete, setChefToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (adminData?.user_id && outletId) {
      fetchChefs();
    }
  }, [adminData?.user_id, outletId]);

  const fetchChefs = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/chef_listview`,
        {
          outlet_id: outletId,
          user_id: adminData.user_id,
          app_source: "admin_dashboard"
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      setChefs(response.data.detail || []);
      setIsLoading(false);
    } catch (error) {
      toastController.error("Failed to fetch chefs list");
      setIsLoading(false);
    }
  };

  const handleViewChef = (user_id) => {
    navigate(`/chef-details/${outletId}/${user_id}`);
  };

  const handleEditChef = (user_id) => {
    navigate(`/edit-chef/${outletId}/${user_id}`);
  };

  const handleDeleteChef = async () => {
    try {
      await toastController.promise(
        axios.delete(`${BASE_URL}/${API_VERSION}/common/chef_delete`, {
          data: {
            update_user_id: adminData.user_id,
            outlet_id: outletId,
            user_id: chefToDelete.toString(),
            app_source: "admin_dashboard",
          },
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }),
        {
          loading: "Deleting chef...",
          success: "Chef deleted successfully",
          error: "Failed to delete chef"
        }
      );

      setShowDeleteModal(false);
      setChefToDelete(null);
      fetchChefs();
    } catch (error) {
      toastController.error(error.response?.data?.msg || "Failed to delete chef");
    }
  };

  const openDeleteModal = (user_id) => {
    setChefToDelete(user_id);
    setShowDeleteModal(true);
  };

  const handleBulkAction = async (action, selectedIds) => {
    try {
      const actionMessages = {
        active: {
          loading: "Activating selected chefs...",
          success: "Successfully activated selected chefs",
          error: "Failed to activate chefs"
        },
        inactive: {
          loading: "Deactivating selected chefs...",
          success: "Successfully deactivated selected chefs",
          error: "Failed to deactivate chefs"
        },
        delete: {
          loading: "Deleting selected chefs...",
          success: "Successfully deleted selected chefs",
          error: "Failed to delete chefs"
        }
      };

      const response = await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/common/bulk_chef_action`,
          {
            user_id: adminData.user_id,
            action: action,
            app_source: "admin_dashboard",
            chef_ids: selectedIds
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

      fetchChefs();
      setSelectedItems([]);
      toastController.success(response.data.detail);
      
    } catch (error) {
      toastController.error(
        error.response?.data?.detail || 
        `Failed to perform ${action} action on selected chefs`
      );
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Outlets', path: '/outlets' },
    { label: 'Chefs' }
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
      ),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (_, chef) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleViewChef(chef.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditChef(chef.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Chef"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(chef.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Chef"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const getTotalCount = () => chefs.length;
  const getActiveCount = () => chefs.filter((chef) => chef.is_active).length;
  const getInactiveCount = () => chefs.filter((chef) => !chef.is_active).length;

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
        data={chefs}
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
        
        // Header props
        title="Chefs"
        counts={{
          total: getTotalCount(),
          active: getActiveCount(),
          inactive: getInactiveCount()
        }}
        showBackButton={true}
        showSearch={true}
        searchPlaceholder="Search chefs..."
        onBackClick={() => navigate(-1)}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate(`/create-chef/${outletId}`),
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
          setChefToDelete(null);
        }}
        title="Confirm Deletion"
        type="error"
        size="small"
        actionButtons={
          <>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setChefToDelete(null);
              }}
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteChef}
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-error-500 px-4 py-3 font-medium text-white hover:bg-error-600"
            >
              Delete Chef
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
            Are you sure you want to delete this chef? <br/>
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </>
  );
}

export default Chefs;