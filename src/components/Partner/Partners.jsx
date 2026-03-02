import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPenToSquare,
  faTrash,
  faPlus,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useAdmin } from "../../hooks/useAdmin";
import DataTable from "../common/DataTable";
import Breadcrumb from "../Breadcrumb";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import { usePartners } from "../../lib/react-query/hooks/usePartners";
import { toastController } from "../../utils/toastController";

// Capitalize first letter of every word (title case)
const toTitleCase = (str) =>
  str
    ? str.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
    : "";

function Partners() {
  const navigate = useNavigate();
  const { adminData } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const {
    partners,
    isLoading,
    error,
    refetch,
    deleteMutation,
    bulkAction,
    counts,
  } = usePartners();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(partnerToDelete.user_id);
      setIsDeleteModalOpen(false);
      setPartnerToDelete(null);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleBulkAction = async (action, selectedIds) => {
    // Convert normalized IDs back to partner IDs
    const partner_ids = selectedIds.map((id) => {
      const partner = partners.find((p) => p.user_id === id);
      return partner.user_id;
    });

    const payload = {
      user_id: adminData.user_id,
      action: action,
      app_source: "pos_app",
      partner_ids: partner_ids,
    };

    bulkAction.mutate(payload, {
      onSuccess: () => {
        setSelectedItems([]);
      }
    });
  };

  // Define columns for DataTable
  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      render: (value) => (
        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{toTitleCase(value)}</p>
      ),
    },
    {
      field: "mobile",
      header: "Mobile",
      sortable: true,
    },

    {
      field: "active_session_count",
      header: "Active Session",
      sortable: true,
      render: (value) => (value !== undefined && value !== null ? value : "-"),
    },
    {
      field: "is_active",
      header: "Status",
      sortable: true,
      render: (value) => (
        <div className="flex items-center justify-center">
          <span
            className={`font-medium text-sm ${value === 1
                ? "text-success-600"
                : "text-error-600"
              }`}
          >
            {value === 1 ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (_, partner) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(`/partner-details/${partner.user_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-3xl shadow-theme-xs transition"
            title="View Partner"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/edit-partner/${partner.user_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-3xl shadow-theme-xs transition"
            title="Edit Partner"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setPartnerToDelete({ user_id: partner.user_id });
              setIsDeleteModalOpen(true);
            }}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-3xl shadow-theme-xs transition"
            title="Delete Partner"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Partners", path: "/partners" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      {error && (
        <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <DataTable
        data={partners.filter((partner) => {
          if (statusFilter === "all") return true;
          const isActive = partner.is_active === 1;
          return statusFilter === "active" ? isActive : !isActive;
        })}
        columns={columns}
        title="Partners"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={counts}
        createButton={{
          label: "Create",
          onClick: () => navigate("/create-partner"),
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
        enableSelection={true}
        onSelectionChange={setSelectedItems}
        selectedItems={selectedItems}
        onBulkAction={handleBulkAction}
        idField="user_id"
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
        }}
        onReload={refetch}
        isLoading={
          isLoading || deleteMutation.isLoading || bulkAction.isLoading
        }
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
        title="Confirm Delete"
        message="Are you sure ?"
      />
    </>
  );
}

export default Partners;
