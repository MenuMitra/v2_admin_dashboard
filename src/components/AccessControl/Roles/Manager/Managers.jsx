import React, { useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdmin } from "../../../../hooks/useAdmin";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import DeleteConfirmModal from '../../../common/DeleteConfirmModal/DeleteConfirmModal';
import { toastController } from "../../../../utils/toastController";
import { API_CONFIG } from "../../../../config/appConfig";

function Managers() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { outletId } = useParams();
  const navigate = useNavigate();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const queryClient = useQueryClient();

  // Local state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  // Query: Fetch managers
  const {
    data: managerResponse,
    isLoading,
    error
  } = useQuery({
    queryKey: ["managers", outletId, adminData?.user_id],
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/manager_listview`,
        {
          outlet_id: outletId,
          user_id: adminData.user_id,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.detail || [];
    },
    enabled: Boolean(adminData?.user_id) && Boolean(outletId)
  });

  // Memoize managers and outletName
  const managers = React.useMemo(() => managerResponse || [], [managerResponse]);
  const outletName = React.useMemo(() => managers[0]?.outlet_name || '', [managers]);

  // Delete manager mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }
      return axios.delete(`${BASE_URL}/${API_VERSION}/common/manager_delete`, {
        data: {
          update_user_id: adminData.user_id,
          outlet_id: outletId,
          user_id: managerToDelete.toString(),
        },
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toastController.success("Manager deleted successfully");
      setShowDeleteModal(false);
      setManagerToDelete(null);
      queryClient.invalidateQueries(["managers", outletId, adminData?.user_id]);
    },
    onError: (err) => {
      toastController.error(err.response?.data?.msg || "Failed to delete manager");
    }
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, selectedIds }) => {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }
      return axios.post(
        `${BASE_URL}/${API_VERSION}/common/bulk_manager_action`,
        {
          user_id: adminData.user_id,
          action: action,
          app_source: "admin_app",
          manager_ids: selectedIds
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
    },
    onSuccess: (_, { action }) => {
      const actionMessages = {
        active: "Successfully activated selected managers",
        inactive: "Successfully deactivated selected managers",
        delete: "Successfully deleted selected managers"
      };
      toastController.success(actionMessages[action] || "Bulk action completed");
      queryClient.invalidateQueries(["managers", outletId, adminData?.user_id]);
      setSelectedItems([]);
    },
    onError: (err, { action }) => {
      const actionMessages = {
        active: "Failed to activate managers",
        inactive: "Failed to deactivate managers",
        delete: "Failed to delete managers"
      };
      toastController.error(
        err.response?.data?.detail || actionMessages[action] || "Failed to perform bulk action"
      );
    }
  });

  // Handlers
  const handleViewManager = React.useCallback((user_id) => {
    navigate(`/manager-details/${outletId}/${user_id}`);
  }, [navigate, outletId]);

  const handleEditManager = React.useCallback((user_id) => {
    navigate(`/edit-manager/${outletId}/${user_id}`);
  }, [navigate, outletId]);

  const openDeleteModal = React.useCallback((user_id) => {
    setManagerToDelete(user_id);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteManager = React.useCallback(() => {
    deleteMutation.mutate();
  }, [deleteMutation]);

  const handleBulkAction = React.useCallback((action, selectedIds) => {
    bulkActionMutation.mutate({ action, selectedIds });
  }, [bulkActionMutation]);

  // DataTable columns
  const columns = React.useMemo(() => [
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
  ], [handleViewManager, handleEditManager, openDeleteModal]);

  // Counts
  const getTotalCount = React.useCallback(() => managers.length, [managers]);
  const getActiveCount = React.useCallback(() => managers.filter((manager) => manager.is_active).length, [managers]);
  const getInactiveCount = React.useCallback(() => managers.filter((manager) => !manager.is_active).length, [managers]);

  const breadcrumbItems = React.useMemo(() => [
    { label: 'Home', path: '/home' },
    { label: 'Outlets', path: '/outlets' },
    { label: outletName || 'Outlet', path: `/view-outlet/${outletId}` },
    { label: 'Managers' }
  ], [outletName, outletId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-error-500 text-center p-4">
        {error.response?.data?.msg || "Failed to load managers"}
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
        enableSelection={true}
        onSelectionChange={setSelectedItems}
        selectedItems={selectedItems}
        onBulkAction={handleBulkAction}
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
          onClick: () => navigate(`/create-manager/${outletId}`, {
            state: { outletName: outletName }
          }),
          className: "bg-success-500 hover:bg-success-600",
          position: "right"
        }}
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setManagerToDelete(null);
        }}
        onDelete={handleDeleteManager}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

export default Managers;