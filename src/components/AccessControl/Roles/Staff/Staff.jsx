import React, { useMemo, useState, useCallback } from "react";
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
import { useAuth } from "../../../../hooks/useAuth";
import { useAdmin } from "../../../../hooks/useAdmin";
import { API_CONFIG } from "../../../../config/appConfig";
import Breadcrumb from "../../../Breadcrumb";
import DataTable from "../../../common/DataTable";
import DeleteConfirmModal from "../../../common/DeleteConfirmModal/DeleteConfirmModal";
import { toastController } from "../../../../utils/toastController";
import { useStaff } from "../../../../lib/react-query/hooks/useStaff";

function Staff() {
  const { outletId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const queryClient = useQueryClient();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const { staffData, isLoading, error, refetch, bulkAction, isBulkActioning } =
    useStaff(getToken(), outletId, adminData?.user_id);

  const lists = useMemo(() => staffData?.lists || [], [staffData]);
  const outletName = useMemo(() => lists[0]?.outlet_name || "", [lists]);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      return axios.delete(`${BASE_URL}/common/delete_staff`, {
        data: {
          staff_id: Number(staffToDelete),
          outlet_id: Number(outletId),
          user_id: adminData.user_id,
          app_source: "admin_app",
        },
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toastController.success("Staff deleted successfully");
      setShowDeleteModal(false);
      setStaffToDelete(null);
      queryClient.invalidateQueries(["staff", outletId, adminData?.user_id]);
    },
    onError: (err) => {
      toastController.error(
        err.response?.data?.detail || "Failed to delete staff"
      );
    },
  });

  const openDeleteModal = useCallback((id) => {
    setStaffToDelete(id);
    setShowDeleteModal(true);
  }, []);

  const handleBulkAction = async (actionKey, selectedIds) => {
    try {
      await bulkAction(
        {
          user_id: adminData.user_id,
          action: actionKey,
          staff_ids: selectedIds,
          outlet_id: outletId,
        },
        {
          onSuccess: (data) => {
            toastController.success(
              data.detail || `Bulk ${actionKey} successful`
            );
            setSelectedItems([]);
            refetch();
          },
          onError: (err) => {
            toastController.error(
              err.response?.data?.detail || `Failed to ${actionKey} staff`
            );
          },
        }
      );
    } catch (err) {
      console.error(`Bulk action ${actionKey} failed:`, err);
    }
  };

  const handleView = useCallback(
    (id) => {
      navigate(`/staff-details/${outletId}/${id}`);
    },
    [navigate, outletId]
  );

  const handleEdit = useCallback(
    (id) => {
      navigate(`/edit-staff/${outletId}/${id}`);
    },
    [navigate, outletId]
  );

  const columns = useMemo(
    () => [
      { field: "name", header: "Name", sortable: true },
      { field: "mobile", header: "Mobile", sortable: true },
      { field: "role", header: "Role", sortable: true },
      {
        field: "is_active",
        header: "Status",
        sortable: true,
        render: (v) => (
          <FontAwesomeIcon
            icon={v ? faCircleCheck : faCircleXmark}
            className={`w-5 h-5 ${v ? "text-success-500" : "text-error-500"}`}
          />
        ),
      },
      {
        field: "actions",
        header: "Actions",
        render: (_, row) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleView(row.user_id)}
              className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
              title="View Staff"
            >
              <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(row.user_id)}
              className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
              title="Edit Staff"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteModal(row.user_id)}
              className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
              title="Delete Staff"
            >
              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [handleEdit, handleView, openDeleteModal]
  );

  // Add bulk action options for DataTable
  const bulkActionOptions = [
    {
      key: "active",
      label: "Active",
      className: "text-success-600 hover:bg-success-50",
    },
    {
      key: "inactive",
      label: "Inactive",
      className: "text-warning-600 hover:bg-warning-50",
    },
    {
      key: "delete",
      label: "Delete",
      className: "text-error-600 hover:bg-error-50",
    },
  ];

  const total = lists.length;
  const active = lists.filter((i) => i.is_active).length;
  const inactive = total - active;

  const breadcrumbItems = useMemo(
    () => [
      { label: "Home", path: "/home" },
      { label: "Outlets", path: "/outlets" },
      { label: outletName || "Outlet", path: `/view-outlet/${outletId}` },
      { label: "Staff" },
    ],
    [outletName, outletId]
  );

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <DataTable
        data={lists}
        columns={columns}
        enablePagination={true}
        itemsPerPageOptions={[10, 20, 30, 40, 50]}
        enableSort={true}
        enableSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        darkMode={true}
        title="Staff"
        isLoading={isLoading || deleteMutation.isLoading}
        onReload={refetch}
        counts={{ total, active, inactive }}
        showBackButton={true}
        showSearch={true}
        searchPlaceholder="Search staff..."
        onBackClick={() => navigate(-1)}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate(`/create-staff/${outletId}`),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
        }}
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        emptyStateMessage="No staff found. Create a new staff to get started!"
        enableSelection={true}
        onSelectionChange={setSelectedItems}
        onBulkAction={(actionKey, selectedIds) =>
          handleBulkAction(actionKey, selectedIds)
        }
        bulkActionOptions={bulkActionOptions}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setStaffToDelete(null);
        }}
        onDelete={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

export default Staff;
