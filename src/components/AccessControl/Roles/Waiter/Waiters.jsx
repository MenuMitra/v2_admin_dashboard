import React, { useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdmin } from "../../../../hooks/useAdmin";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_CONFIG } from "../../../../config/appConfig";
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
import { queryKeys } from "../../../../lib/react-query/queryKeys";

const { BASE_URL, API_VERSION } = API_CONFIG;

function Waiters() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { outletId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [waiterToDelete, setWaiterToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch waiters query
  const {
    data: waitersResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.waiters.list(outletId),
    queryFn: async () => {
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/waiter_listview`,
        {
          user_id: adminData.user_id,
          outlet_id: Number(outletId),
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    enabled: Boolean(adminData?.user_id) && Boolean(outletId),
  });

  // Delete waiter mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      return axios.delete(`${BASE_URL}/${API_VERSION}/common/waiter_delete`, {
        data: {
          update_user_id: adminData.user_id,
          outlet_id: outletId,
          user_id: userId.toString(),
          app_source: "admin_app",
        },
        headers: {
          Authorization: getToken(),
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toastController.success("Waiter deleted successfully");
      setShowDeleteModal(false);
      setWaiterToDelete(null);
      queryClient.invalidateQueries(queryKeys.waiters.list(outletId));
    },
    onError: (error) => {
      toastController.error(
        error.response?.data?.msg || "Failed to delete waiter"
      );
    },
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, selectedIds }) => {
      return axios.post(
        `${BASE_URL}/${API_VERSION}/common/bulk_waiter_action`,
        {
          user_id: adminData.user_id,
          action: action,
          app_source: "admin_app",
          waiter_ids: selectedIds,
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
    },
    onSuccess: (_, variables) => {
      toastController.success(
        `Successfully ${variables.action}d selected waiters`
      );
      setSelectedItems([]);
      queryClient.invalidateQueries(queryKeys.waiters.list(outletId));
    },
    onError: (error, variables) => {
      toastController.error(
        error.response?.data?.detail ||
          `Failed to perform ${variables.action} action on selected waiters`
      );
    },
  });

  // Memoized values
  const waiters = React.useMemo(
    () =>
      error && error.response?.data?.detail === "Outlet has no waiters"
        ? []
        : waitersResponse?.data || [],
    [waitersResponse, error]
  );

  const outletName = React.useMemo(
    () => waiters[0]?.outlet_name || "",
    [waiters]
  );

  // Memoized breadcrumb items
  const breadcrumbItems = React.useMemo(
    () => [
      { label: "Home", path: "/home" },
      { label: "Outlets", path: "/outlets" },
      { label: outletName || "Outlet", path: `/view-outlet/${outletId}` },
      { label: "Waiters" },
    ],
    [outletName, outletId]
  );

  // Memoized handlers
  const handleViewWaiter = React.useCallback(
    (user_id) => {
      navigate(`/waiter-details/${outletId}/${user_id}`);
    },
    [navigate, outletId]
  );

  const handleEditWaiter = React.useCallback(
    (user_id) => {
      navigate(`/edit-waiter/${outletId}/${user_id}`);
    },
    [navigate, outletId]
  );

  const handleDeleteWaiter = React.useCallback(() => {
    if (waiterToDelete) {
      deleteMutation.mutate(waiterToDelete);
    }
  }, [waiterToDelete, deleteMutation]);

  const handleBulkAction = React.useCallback(
    (action, selectedIds) => {
      bulkActionMutation.mutate({ action, selectedIds });
    },
    [bulkActionMutation]
  );

  // Memoized counts
  const counts = React.useMemo(
    () => ({
      total: waiters.length,
      active: waiters.filter((waiter) => waiter.is_active).length,
      inactive: waiters.filter((waiter) => !waiter.is_active).length,
    }),
    [waiters]
  );

  // Column definition
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
        render: (_, waiter) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleViewWaiter(waiter.user_id)}
              className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
              title="View Details"
            >
              <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEditWaiter(waiter.user_id)}
              className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
              title="Edit Waiter"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setWaiterToDelete(waiter.user_id);
                setShowDeleteModal(true);
              }}
              className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
              title="Delete Waiter"
            >
              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [handleViewWaiter, handleEditWaiter]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    // If the error is "Outlet has no waiters", treat as empty data
    const noWaiters = error.response?.data?.detail === "Outlet has no waiters";
    if (!noWaiters) {
      return (
        <div className="text-error-500 text-center p-4">
          {error.response?.data?.msg ||
            error.response?.data?.detail ||
            "Failed to load waiters"}
        </div>
      );
    }
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <DataTable
        data={waiters}
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
        title="Waiters"
        counts={counts}
        showBackButton={true}
        showSearch={true}
        searchPlaceholder="Search waiters..."
        onBackClick={() => navigate(-1)}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () =>
            navigate(`/create-waiter/${outletId}`, {
              state: { outletName: outletName },
            }),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
        }}
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setWaiterToDelete(null);
        }}
        onDelete={handleDeleteWaiter}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

export default Waiters;
