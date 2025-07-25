import React, { useState, useMemo } from "react";
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
import Breadcrumb from "../Breadcrumb";
import DataTable from "../common/DataTable";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import { useSuperOwners } from "../../lib/react-query/hooks/useSuperOwners";
import { toastController } from "../../utils/toastController";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/react-query/queryKeys";
import { useAuth } from "../../hooks/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import axios from "axios";

function SuperOwner() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();

  const { superOwners, isLoading, error, refetch, deleteMutation, bulkAction } =
    useSuperOwners();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Normalize the data for selection handling
  const normalizedSuperOwners = useMemo(() => {
    return superOwners.map((owner) => ({
      ...owner,
      id: owner.super_owner_id, // Normalize id field for selection
    }));
  }, [superOwners]);

  const handleViewDetails = (superOwnerId) => {
    // Simply navigate to the details page
    navigate(`/super-owner-details/${superOwnerId}`);
  };

  const handleEditOwner = (superOwnerId) => {
    navigate(`/edit-super-owner/${superOwnerId}`);
  };

  const openDeleteModal = (superOwnerId) => {
    setOwnerToDelete(superOwnerId);
    setShowDeleteModal(true);
  };

  const handleDeleteOwner = async () => {
    try {
      await deleteMutation.mutateAsync(ownerToDelete);
      setShowDeleteModal(false);
      setOwnerToDelete(null);
    } catch (err) {
      // Error handling is done in the mutation
      setShowDeleteModal(false);
      setOwnerToDelete(null);
    }
  };

  const handleBulkAction = async (action, selectedIds) => {
    try {
      // Convert the normalized ids back to super_owner_ids
      const super_owner_ids = selectedIds.map((id) => {
        const superOwner = superOwners.find(
          (owner) => owner.super_owner_id === id
        );
        return superOwner.super_owner_id;
      });

      const payload = {
        user_id: adminData.user_id,
        action: action,
        app_source: "pos_app",
        super_owner_ids: super_owner_ids,
      };

      await bulkAction.mutateAsync(payload);
      setSelectedItems([]);
      toastController.success("Bulk action completed successfully!");
    } catch (error) {
      console.error("Error performing bulk action:", error);
      toastController.error(
        error.response?.data?.detail || "Failed to process bulk action"
      );
    }
  };

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Super Owners", path: "/super-owners" },
  ];

  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      headerClassName: "text-center",
      render: (value) => (
        <div className="flex items-center justify-center gap-3">
          <div>
            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
              {value}
            </p>
          </div>
        </div>
      ),
    },
    {
      field: "outlet_ids",
      header: "Outlets",
      sortable: true,
      headerClassName: "text-center",
      render: (value) => (
        <div className="flex items-center justify-center">
          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
            {Array.isArray(value) ? value.length : 0}
          </span>
        </div>
      ),
    },
    {
      field: "email",
      header: "Email",
      sortable: true,
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      field: "mobile",
      header: "Mobile",
      sortable: true,
      headerClassName: "text-center",
      className: "text-center",
    },
    {
      field: "is_active",
      header: "Status",
      sortable: true,
      headerClassName: "text-center",
      render: (value) => (
        <div className="flex items-center justify-center gap-2">
          <FontAwesomeIcon
            icon={value ? faCircleCheck : faCircleXmark}
            className={`w-5 h-5 ${
              value ? "text-success-500" : "text-error-500"
            }`}
          />
          <span
            className={`text-base font-medium ${
              value ? "text-success-700" : "text-error-700"
            }`}
          ></span>
        </div>
      ),
    },
    {
      field: "active_session_count",
      header: "Active Session",
      sortable: true,
      headerClassName: "text-center",
      render: (value) => (value !== undefined && value !== null ? value : "-"),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      headerClassName: "text-center",
      render: (_, owner) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleViewDetails(owner.super_owner_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditOwner(owner.super_owner_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Super Owner"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(owner.super_owner_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Super Owner"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const getTotalCount = () => superOwners.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <DataTable
        // Use normalized data instead of direct superOwners
        data={normalizedSuperOwners.filter((owner) => {
          if (statusFilter === "all") return true;
          const isActive = owner.is_active === true;
          return statusFilter === "active" ? isActive : !isActive;
        })}
        columns={columns}
        itemsPerPage={10}
        enableSort={true}
        enablePagination={true}
        enableSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        darkMode={true}
        enableSelection={true}
        onSelectionChange={setSelectedItems}
        selectedItems={selectedItems}
        onBulkAction={handleBulkAction}
        title="Super Owners"
        counts={{
          total: getTotalCount(),
        }}
        showBackButton={true}
        showSearch={true}
        searchPlaceholder="Search"
        onBackClick={() => navigate(-1)}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate("/create-super-owner"),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
        }}
        error={error?.message}
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
        }}
        onReload={refetch}
        idField="super_owner_id"
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

export default SuperOwner;
