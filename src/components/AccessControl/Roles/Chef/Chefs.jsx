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
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from '../../../Breadcrumb';
import DataTable from '../../../common/DataTable';
import DeleteConfirmModal from "../../../common/DeleteConfirmModal/DeleteConfirmModal";
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
  const [outletName, setOutletName] = useState('');

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
          app_source: "admin_app"
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      setChefs(response.data.detail || []);
      
      if (response.data.detail && response.data.detail.length > 0) {
        setOutletName(response.data.detail[0].outlet_name);
      }
      
      setIsLoading(false);
    } catch {
      toastController.error("outlet has no chef");
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
            app_source: "admin_app",
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
            app_source: "admin_app",
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
    { label: outletName || 'Outlet', path: `/view-outlet/${outletId}` },
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

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setChefToDelete(null);
        }}
        onDelete={handleDeleteChef}
      />
    </>
  );
}

export default Chefs;