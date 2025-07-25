import React, { useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdmin } from "../../../../hooks/useAdmin";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import Breadcrumb from "../../../Breadcrumb";
import DataTable from "../../../common/DataTable";
import DeleteConfirmModal from "../../../common/DeleteConfirmModal/DeleteConfirmModal";
import { toastController } from "../../../../utils/toastController";
import { API_CONFIG } from "../../../../config/appConfig";
import { queryKeys } from "../../../../lib/react-query/queryKeys";

function Chefs() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { outletId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { BASE_URL, API_VERSION } = API_CONFIG;

  // Local state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chefToDelete, setChefToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch chefs query
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.chefs.list(outletId),
    queryFn: async () => {
      const token = getToken();
      try {
        const response = await axios.post(
          `${BASE_URL}/${API_VERSION}/common/chef_listview`,
          {
            outlet_id: outletId,
            user_id: adminData.user_id,
            app_source: "admin_app",
          },
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        );
        return response.data;
      } catch (error) {
        // If the error is "Outlet has no chef", return an empty array instead of throwing
        if (error.response?.data?.detail === "Outlet has no chef") {
          return { detail: [] };
        }
        throw error; // Throw other errors to be handled by error boundary
      }
    },
    enabled: Boolean(adminData?.user_id) && Boolean(outletId),
  });

  // Delete chef mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      return axios.delete(`${BASE_URL}/${API_VERSION}/common/chef_delete`, {
        data: {
          update_user_id: adminData.user_id,
          outlet_id: outletId,
          user_id: chefToDelete.toString(),
          app_source: "admin_app",
        },
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toastController.success("Chef deleted successfully");
      setShowDeleteModal(false);
      setChefToDelete(null);
      queryClient.invalidateQueries(queryKeys.chefs.list(outletId));
    },
    onError: (error) => {
      toastController.error(
        error.response?.data?.msg || "Failed to delete chef"
      );
    },
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, selectedIds }) => {
      const token = getToken();
      return axios.post(
        `${BASE_URL}/${API_VERSION}/common/bulk_chef_action`,
        {
          user_id: adminData.user_id,
          action: action,
          app_source: "admin_app",
          chef_ids: selectedIds,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
    },
    onSuccess: (_, variables) => {
      const actionMessages = {
        active: "Successfully activated selected chefs",
        inactive: "Successfully deactivated selected chefs",
        delete: "Successfully deleted selected chefs",
      };
      toastController.success(actionMessages[variables.action]);
      setSelectedItems([]);
      queryClient.invalidateQueries(queryKeys.chefs.list(outletId));
    },
    onError: (error, variables) => {
      toastController.error(
        error.response?.data?.detail ||
          `Failed to perform ${variables.action} action on selected chefs`
      );
    },
  });

  // Memoized values
  const chefs = React.useMemo(() => {
    if (Array.isArray(response?.detail)) {
      return response.detail;
    }
    return [];
  }, [response]);

  const outletName = React.useMemo(() => {
    // Try to get outlet name from first chef, if not available use 'Outlet'
    return chefs.length > 0 ? chefs[0].outlet_name : "Outlet";
  }, [chefs]);

  // Memoized counts
  const counts = React.useMemo(
    () => ({
      total: chefs.length,
      active: chefs.filter((chef) => chef.is_active).length,
      inactive: chefs.filter((chef) => !chef.is_active).length,
    }),
    [chefs]
  );

  // Memoized breadcrumb items
  const breadcrumbItems = React.useMemo(
    () => [
      { label: "Home", path: "/home" },
      { label: "Outlets", path: "/outlets" },
      { label: outletName || "Outlet", path: `/view-outlet/${outletId}` },
      { label: "Chefs" },
    ],
    [outletName, outletId]
  );

  // Memoized handlers
  const handleViewChef = React.useCallback(
    (user_id) => {
      navigate(`/chef-details/${outletId}/${user_id}`);
    },
    [navigate, outletId]
  );

  const handleEditChef = React.useCallback(
    (user_id) => {
      navigate(`/edit-chef/${outletId}/${user_id}`);
    },
    [navigate, outletId]
  );

  const openDeleteModal = React.useCallback((user_id) => {
    setChefToDelete(user_id);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteChef = React.useCallback(() => {
    deleteMutation.mutate();
  }, [deleteMutation]);

  const handleBulkAction = React.useCallback(
    (action, selectedIds) => {
      bulkActionMutation.mutate({ action, selectedIds });
    },
    [bulkActionMutation]
  );

  // Memoized columns configuration
  const columns = React.useMemo(
    () => [
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
        field: "active_session_count",
        header: "Active Session",
        sortable: true,
        render: (value) =>
          value !== undefined && value !== null ? value : "-",
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
    ],
    [handleViewChef, handleEditChef, openDeleteModal]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Only show error for actual errors, not for "no chef" case
  if (error && error.response?.data?.detail !== "Outlet has no chef") {
    return (
      <div className="text-error-500 text-center p-4">
        {error.response?.data?.msg || "Failed to load chefs"}
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
          total: chefs.length,
          active: chefs.filter((chef) => chef.is_active).length,
          inactive: chefs.filter((chef) => !chef.is_active).length,
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
          position: "right",
        }}
        // Add status filter props
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        // Add empty state message
        emptyStateMessage="No chefs found. Create a new chef to get started!"
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setChefToDelete(null);
        }}
        onDelete={handleDeleteChef}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

export default Chefs;
