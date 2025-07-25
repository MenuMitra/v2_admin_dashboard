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

function Captains() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { outletId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { BASE_URL, API_VERSION } = API_CONFIG;

  // Local state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [captainToDelete, setCaptainToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch captains query
  const { data: captainsResponse, isLoading } = useQuery({
    queryKey: queryKeys.captains.list(outletId),
    queryFn: async () => {
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/captain_listview`,
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

  // Delete captain mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      return axios.delete(`${BASE_URL}/${API_VERSION}/common/captain_delete`, {
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
      toastController.success("Captain deleted successfully");
      setShowDeleteModal(false);
      setCaptainToDelete(null);
      queryClient.invalidateQueries(queryKeys.captains.list(outletId));
    },
    onError: (error) => {
      toastController.error(
        error.response?.data?.detail || "Failed to delete captain"
      );
    },
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, selectedIds }) => {
      return axios.post(
        `${BASE_URL}/${API_VERSION}/common/bulk_captain_action`,
        {
          user_id: adminData.user_id,
          action: action,
          app_source: "admin_app",
          captain_ids: selectedIds,
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
        `Successfully ${variables.action}d selected captains`
      );
      setSelectedItems([]);
      queryClient.invalidateQueries(queryKeys.captains.list(outletId));
    },
    onError: (error, variables) => {
      toastController.error(
        error.response?.data?.detail ||
          `Failed to perform ${variables.action} action on selected captains`
      );
    },
  });

  // Memoized values
  const captains = React.useMemo(
    () => captainsResponse?.data || [],
    [captainsResponse]
  );

  const outletName = React.useMemo(
    () => captains[0]?.outlet_name || "",
    [captains]
  );

  const breadcrumbItems = React.useMemo(
    () => [
      { label: "Home", path: "/home" },
      { label: "Outlets", path: "/outlets" },
      { label: outletName || "Outlet", path: `/view-outlet/${outletId}` },
      { label: "Captains" },
    ],
    [outletName, outletId]
  );

  // Memoized handlers
  const handleViewCaptain = React.useCallback(
    (user_id) => {
      navigate(`/captain-details/${outletId}/${user_id}`);
    },
    [navigate, outletId]
  );

  const handleEditCaptain = React.useCallback(
    (user_id) => {
      navigate(`/edit-captain/${outletId}/${user_id}`);
    },
    [navigate, outletId]
  );

  const handleDeleteCaptain = React.useCallback(() => {
    if (captainToDelete) {
      deleteMutation.mutate(captainToDelete);
    }
  }, [captainToDelete, deleteMutation]);

  const handleBulkAction = React.useCallback(
    (action, selectedIds) => {
      bulkActionMutation.mutate({ action, selectedIds });
    },
    [bulkActionMutation]
  );

  // Memoized counts
  const counts = React.useMemo(
    () => ({
      total: captains.length,
      active: captains.filter((captain) => captain.is_active).length,
      inactive: captains.filter((captain) => !captain.is_active).length,
    }),
    [captains]
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
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              value ? "text-success-700" : "text-error-700"
            }`}
          >
            <FontAwesomeIcon
              icon={value ? faCircleCheck : faCircleXmark}
              className="w-3.5 h-3.5"
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
        render: (_, captain) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleViewCaptain(captain.user_id)}
              className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
              title="View Details"
            >
              <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEditCaptain(captain.user_id)}
              className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
              title="Edit Captain"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCaptainToDelete(captain.user_id);
                setShowDeleteModal(true);
              }}
              className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
              title="Delete Captain"
            >
              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [handleViewCaptain, handleEditCaptain]
  );

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
        data={captains}
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
        title="Captains"
        counts={counts}
        showBackButton={true}
        showSearch={true}
        searchPlaceholder="Search captains..."
        onBackClick={() => navigate(-1)}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate(`/create-captain/${outletId}`),
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
          setCaptainToDelete(null);
        }}
        onDelete={handleDeleteCaptain}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

export default Captains;
