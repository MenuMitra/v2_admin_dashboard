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

function Partners() {
  const navigate = useNavigate();
  const { adminData } = useAdmin();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);

  const {
    partners,
    isLoading,
    error,
    refetch,
    deleteMutation,
    counts,
  } = usePartners();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(partnerToDelete.user_id);
      setIsDeleteModalOpen(false);
      setPartnerToDelete(null);
    } catch (err) {
      // Error handling is done in the mutation
    }
  };

  const handleBulkAction = async (action) => {
    // Implement bulk actions if needed
    console.log('Bulk action:', action);
  };

  // Define columns for DataTable
  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
    },
    {
      field: "mobile",
      header: "Mobile",
      sortable: true,
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
          <span
            className={`text-base font-medium ${
              value === 1 ? "text-success-700" : "text-error-700"
            }`}
          ></span>
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
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Partner"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/edit-partner/${partner.user_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Partner"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setPartnerToDelete({ user_id: partner.user_id });
              setIsDeleteModalOpen(true);
            }}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
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
        enableSearch={true}
        itemsPerPage={10}
        onBackClick={() => navigate(-1)}
        showBackButton={true}
        backButtonLabel="Back"
        enableSelection={true}
        onSelectionChange={() => {}}
        onBulkAction={handleBulkAction}
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
        }}
        onReload={refetch}
        isLoading={deleteMutation.isLoading}
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
