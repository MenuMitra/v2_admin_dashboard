import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPenToSquare,
  faTrash,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "../common/DataTable";
import Breadcrumb from "../Breadcrumb";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import { useOwners } from "../../lib/react-query/hooks/useOwners";
import { toastController } from "../../utils/toastController";

const toTitleCase = (str) =>
  str
    ? str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    : "";

function Owners() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);

  const {
    owners,
    isLoading,
    error,
    refetch,
    deleteMutation,
    updateMutation,
    counts,
  } = useOwners({ filter: statusFilter });

  const isUpdating =
    updateMutation.isPending || updateMutation.isLoading;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(ownerToDelete.owner_id);
      setIsDeleteModalOpen(false);
      setOwnerToDelete(null);
    } catch {
      // handled in hook
    }
  };

  const handleToggleOwnerActive = (owner) => {
    const isActive = owner.is_active === true || Number(owner.is_active) === 1;
    const nextIsActive = isActive ? 0 : 1;
    const outletIds = Array.isArray(owner.outlets)
      ? owner.outlets.map((o) => Number(o.outlet_id)).filter(Boolean)
      : undefined;

    updateMutation.mutate(
      {
        owner_id: Number(owner.owner_id),
        name: owner.name || "",
        mobile: owner.mobile || "",
        email: owner.email || "",
        aadhar: owner.aadhar || undefined,
        pan: owner.pan || undefined,
        address: owner.address || undefined,
        is_active: nextIsActive,
        ...(outletIds?.length ? { outlet_ids: outletIds } : {}),
      },
      {
        onSuccess: () => {
          toastController.success(
            `Owner marked as ${nextIsActive === 1 ? "Active" : "Inactive"}`
          );
        },
        onError: (err) => {
          toastController.error(
            err.response?.data?.detail ||
              err.response?.data?.message ||
              "Failed to update owner status"
          );
        },
      }
    );
  };

  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      render: (value) => (
        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
          {toTitleCase(value)}
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
      render: (value) => value || "-",
    },
    {
      field: "company_name",
      header: "Company",
      sortable: true,
      render: (value) => toTitleCase(value) || "-",
    },
    {
      field: "outlet_count",
      header: "Outlets",
      sortable: true,
      render: (value) => (value !== undefined && value !== null ? value : "-"),
    },
    {
      field: "is_active",
      header: "Status",
      sortable: true,
      render: (value, owner) => {
        const isActive = value === true || Number(value) === 1;
        return (
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => handleToggleOwnerActive(owner)}
              disabled={isUpdating}
              className={`text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                isActive ? "text-success-600" : "text-error-600"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
              title={`Click to mark as ${isActive ? "Inactive" : "Active"}`}
            >
              {isActive ? "Active" : "Inactive"}
            </button>
          </div>
        );
      },
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (_, owner) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(`/owner-details/${owner.owner_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-3xl shadow-theme-xs transition"
            title="View Owner"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/edit-owner/${owner.owner_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-3xl shadow-theme-xs transition"
            title="Edit Owner"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setOwnerToDelete({ owner_id: owner.owner_id });
              setIsDeleteModalOpen(true);
            }}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-3xl shadow-theme-xs transition"
            title="Delete Owner"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Owners" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      {error && (
        <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error?.response?.data?.detail ||
            error?.message ||
            "Failed to load owners"}
        </div>
      )}

      <DataTable
        data={owners}
        columns={columns}
        title="Owners"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={counts}
        createButton={{
          label: "Create",
          onClick: () => navigate("/create-owner"),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
          icon: faPlus,
          showIconOnly: false,
        }}
        searchPlaceholder="Search"
        enableSort={true}
        enablePagination={true}
        itemsPerPage={50}
        itemsPerPageOptions={[25, 50, 100, 200]}
        enableSearch={true}
        onBackClick={() => navigate(-1)}
        showBackButton={true}
        backButtonLabel="Back"
        idField="owner_id"
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onReload={refetch}
        isLoading={
          isLoading ||
          deleteMutation.isPending ||
          deleteMutation.isLoading ||
          isUpdating
        }
        emptyStateMessage="No owners found."
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this owner?"
      />
    </>
  );
}

export default Owners;
