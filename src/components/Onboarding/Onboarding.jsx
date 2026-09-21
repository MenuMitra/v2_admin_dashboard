import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPenToSquare,
  faTrash,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "../common/DataTable";
import Breadcrumb from "../Breadcrumb";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import { useOnboarding } from "../../lib/react-query/hooks/useOnboarding";

const toTitleCase = (str) =>
  str
    ? String(str).replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    : "";

function Onboarding() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const {
    onboardings,
    isLoading,
    error,
    refetch,
    deleteMutation,
    activateMutation,
    counts,
  } = useOnboarding({ status: statusFilter });

  const isBusy =
    deleteMutation.isPending ||
    deleteMutation.isLoading ||
    activateMutation.isPending ||
    activateMutation.isLoading;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(selectedItem.onboarding_id);
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
    } catch {
      // handled in hook
    }
  };

  const handleActivate = async () => {
    try {
      await activateMutation.mutateAsync(selectedItem.onboarding_id);
      setIsActivateModalOpen(false);
      setSelectedItem(null);
    } catch {
      // handled in hook
    }
  };

  const columns = [
    {
      field: "outlet_name",
      header: "Outlet",
      sortable: true,
      render: (value) => (
        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
          {toTitleCase(value)}
        </p>
      ),
    },
    {
      field: "outlet_type",
      header: "Type",
      sortable: true,
      render: (value) => toTitleCase(value) || "-",
    },
    {
      field: "outlet_mobile",
      header: "Mobile",
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
      field: "company_type",
      header: "Company Type",
      sortable: true,
      render: (value) =>
        value ? toTitleCase(String(value).replace(/_/g, " ")) : "-",
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      render: (value) => {
        const isPending = value === "pending";
        return (
          <span
            className={`text-sm font-medium ${
              isPending ? "text-warning-600" : "text-success-600"
            }`}
          >
            {toTitleCase(value) || "-"}
          </span>
        );
      },
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (_, item) => {
        const isPending = item.status === "pending";
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() =>
                navigate(`/onboarding-details/${item.onboarding_id}`)
              }
              className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-3xl shadow-theme-xs transition"
              title="View Onboarding"
            >
              <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
            </button>
            {isPending && (
              <>
                <button
                  onClick={() =>
                    navigate(`/edit-onboarding/${item.onboarding_id}`)
                  }
                  className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-3xl shadow-theme-xs transition"
                  title="Edit Onboarding"
                >
                  <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setIsActivateModalOpen(true);
                  }}
                  disabled={isBusy}
                  className="w-8 h-8 flex items-center justify-center text-white bg-success-500 hover:bg-success-600 rounded-3xl shadow-theme-xs transition disabled:opacity-60"
                  title="Activate Onboarding"
                >
                  <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setIsDeleteModalOpen(true);
                  }}
                  disabled={isBusy}
                  className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-3xl shadow-theme-xs transition disabled:opacity-60"
                  title="Delete Onboarding"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Onboarding" },
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
            "Failed to load onboardings"}
        </div>
      )}

      <DataTable
        data={onboardings}
        columns={columns}
        title="Onboarding"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={counts}
        searchPlaceholder="Search"
        enableSort={true}
        enablePagination={true}
        itemsPerPage={50}
        itemsPerPageOptions={[25, 50, 100, 200]}
        enableSearch={true}
        onBackClick={() => navigate(-1)}
        showBackButton={true}
        backButtonLabel="Back"
        idField="onboarding_id"
        enableStatusFilter={false}
        customFilters={[
          {
            type: "select",
            label: "Status",
            placeholder: "Select Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "pending", label: "Pending" },
              { value: "activated", label: "Activated" },
              { value: "all", label: "All" },
            ],
          },
        ]}
        onReload={refetch}
        isLoading={isLoading || isBusy}
        emptyStateMessage="No onboardings found."
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        onDelete={handleDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this onboarding?"
      />

      <DeleteConfirmModal
        isOpen={isActivateModalOpen}
        onClose={() => {
          setIsActivateModalOpen(false);
          setSelectedItem(null);
        }}
        onDelete={handleActivate}
        title="Confirm Activate"
        message="Activate this onboarding? This will create the company, outlet, and owner accounts."
        confirmLabel="Activate"
      />
    </>
  );
}

export default Onboarding;
