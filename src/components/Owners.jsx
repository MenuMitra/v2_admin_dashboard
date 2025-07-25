import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEye,
  faPenToSquare,
  faTrash,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "./Breadcrumb";
import TablesViewHeader from "./common/TablesViewHeader";
import DataTable from "./common/DataTable";
import DeleteConfirmModal from "./common/DeleteConfirmModal/DeleteConfirmModal";
import { toastController } from "../utils/toastController";
import { useOwners } from "../lib/react-query/hooks/useOwners";

function Owners() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  // Replace axios calls with TanStack Query hook
  const {
    owners,
    isLoading,
    error,
    deleteOwner,
    isDeleting,
    deleteError,
    bulkAction,
    isBulkActioning,
    bulkActionError,
    refetch: fetchOwners,
  } = useOwners(getToken(), adminData?.user_id);

  const handleViewOwner = (owner_id) => {
    navigate(`/owner-details/${owner_id}`);
  };

  const handleEditOwner = (owner_id) => {
    navigate(`/edit-owner/${owner_id}`);
  };

  const handleDeleteOwner = async () => {
    try {
      await deleteOwner(
        { ownerId: ownerToDelete, userId: adminData.user_id },
        {
          onSuccess: () => {
            setShowDeleteModal(false);
            setOwnerToDelete(null);
            toastController.success("Owner deleted successfully!");
          },
          onError: (err) => {
            toastController.error(
              err.response?.data?.detail || "Failed to delete owner"
            );
          },
        }
      );
    } catch (error) {
      console.error("Error deleting owner:", error);
    }
  };

  const openDeleteModal = (owner_id) => {
    setOwnerToDelete(owner_id);
    setShowDeleteModal(true);
  };

  const getTotalCount = () => owners.length;
  const getActiveCount = () =>
    owners.filter((owner) => owner.is_active === 1).length;
  const getInactiveCount = () =>
    owners.filter((owner) => owner.is_active === 0).length;

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Owners" },
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
      field: "outlet_count",
      header: "Outlets",
      sortable: true,
      render: (value) => (
        <div className="text-center">
          <span className="px-2 py-1 text-sm font-medium text-gray-800 dark:text-white/90">
            {value || 0}
          </span>
        </div>
      ),
    },
    {
      field: "is_active",
      header: "Status",
      sortable: true,
      render: (value) => (
        <div className="flex items-center justify-center gap-2">
          <FontAwesomeIcon
            icon={value === 1 ? faCircleCheck : faCircleXmark}
            className={`w-5 h-5 ${
              value === 1 ? "text-success-500" : "text-error-500"
            }`}
          />
        </div>
      ),
    },
    {
      field: "active_session_count",
      header: "Active Session",
      sortable: true,
      render: (value) => (value !== undefined && value !== null ? value : "-"),
    },
    {
      field: "account_type",
      header: "Account Type",
      sortable: true,
      render: (value) => (
        <span
          className={`inline-block px-2 py-1 text-xs ${
            value === "live" ? "text-error-600" : "text-success-600"
          }`}
        >
          {value?.toUpperCase()}
        </span>
      ),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (_, owner) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleViewOwner(owner.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditOwner(owner.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Owner"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(owner.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Owner"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleBulkAction = async (action, selectedIds) => {
    try {
      await bulkAction(
        { userIds: selectedIds, action, userId: adminData.user_id },
        {
          onSuccess: () => {
            setSelectedItems([]);
            toastController.success("Bulk action completed successfully!");
          },
          onError: (err) => {
            toastController.error(
              err.response?.data?.detail || "Failed to process bulk action"
            );
          },
        }
      );
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-error-500">
          {error.message || "Failed to load owners"}
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <DataTable
        data={owners}
        columns={columns}
        enablePagination={true}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[50, 100, 200]}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(Number(value));
        }}
        enableSort={true}
        enableAccountTypeFilter={false}
        enableSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        darkMode={true}
        // Enable selection and bulk actions
        enableSelection={true}
        onBulkAction={handleBulkAction}
        onSelectionChange={setSelectedItems}
        selectedItems={selectedItems}
        // Header props
        title="Owners"
        counts={{
          total: getTotalCount(),
          active: getActiveCount(),
          inactive: getInactiveCount(),
        }}
        showBackButton={true}
        showSearch={true}
        searchPlaceholder="Search"
        onBackClick={() => navigate("/home")}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate("/create-owner"),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
        }}
        // Add status filter props
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
        }}
        onReload={fetchOwners}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setOwnerToDelete(null);
        }}
        onDelete={handleDeleteOwner}
        title="Confirm Delete"
        message="Are you sure ?"
      />
    </>
  );
}

export default Owners;
