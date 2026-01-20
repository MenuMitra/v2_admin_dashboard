import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faTrash,
  faEye,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../hooks/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import DataTable from "../common/DataTable";
import Breadcrumb from "../Breadcrumb";
import { toastController } from "../../utils/toastController";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { useCompanies } from "../../lib/react-query/hooks/useCompanies";

// Capitalize first letter of every word (title case)
const toTitleCase = (str) =>
  str
    ? str.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    : "";

function Companies() {
  const { getToken, getUserId } = useAuth();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  // Replace axios calls with TanStack Query hook
  const {
    companies: companiesData,
    isLoading,
    error,
    deleteCompany,
    isDeleting,
    deleteError,
    bulkAction,
    isBulkActioning,
    bulkActionError,
    refetch: reloadfetchCompanies,
  } = useCompanies(getToken(), adminData?.user_id);

  // Ensure companies is always an array
  const companies = Array.isArray(companiesData) ? companiesData : [];

  // Debug logging (can be removed in production)
  console.log('Companies loaded:', companies?.length || 0, 'companies');

  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Companies", path: "/companies" },
  ];

  const handleDeleteCompany = async () => {
    if (!companyToDelete || !adminData?.user_id) {
      toastController.error("Missing required data for deletion");
      return;
    }

    try {
      deleteCompany(
        { companyId: companyToDelete, userId: adminData?.user_id },
        {
          onSuccess: (data) => {
            setShowDeleteModal(false);
            setCompanyToDelete(null);
            toastController.success(
              data.message || "Company deleted successfully"
            );
          },
          onError: (error) => {
            console.error("Delete error:", error);
            const errorMessage =
              error.response?.data?.message || 
              error.message || 
              "Failed to delete company";
            toastController.error(errorMessage);
          },
        }
      );
    } catch (error) {
      console.error("Delete error:", error);
      toastController.error("An unexpected error occurred");
    }
  };

  const handleBulkAction = async (action, selectedIds) => {
    try {
      bulkAction(
        { companyIds: selectedIds, action },
        {
          onSuccess: (data) => {
            setSelectedCompanies([]);
            toastController.success(data.detail || `Bulk ${action} successful`);
          },
          onError: (err) => {
            toastController.error(
              err.response?.data?.detail || `Failed to ${action} companies`
            );
          },
        }
      );
    } catch (err) {
      console.error("Bulk action error:", err);
    }
  };

  // Define columns for DataTable
  const columns = [
    {
      field: "company_name",
      header: "Company Name",
      sortable: true,
      render: (value) => (
        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
          {toTitleCase(value)}
        </p>
      ),
    },
    {
      field: "company_type",
      header: "Company Type",
      sortable: true,
      render: (value) => toTitleCase(value) || "-",
    },
    {
      field: "pan",
      header: "PAN",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-gray-700">
          {value || "-"}
        </span>
      ),
    },
    {
      field: "fssai",
      header: "FSSAI",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-gray-700">
          {value || "-"}
        </span>
      ),
    },
    {
      field: "owner_count",
      header: "Owner Count",
      sortable: true,
      render: (value) => value !== undefined && value !== null ? value : 0,
    },
    {
      field: "is_active",
      header: "Status",
      sortable: true,
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (_, company) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => navigate(`/company-details/${company.company_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-3xl shadow-theme-xs transition"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/edit-company/${company.company_id}`)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-3xl shadow-theme-xs transition"
            title="Edit Company"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCompanyToDelete(company.company_id);
              setShowDeleteModal(true);
            }}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-3xl shadow-theme-xs transition"
            title="Delete Company"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Bulk action options
  const bulkActionOptions = [
    {
      key: "active",
      label: "Active",
      icon: faCheck,
      className: "text-success-600 hover:bg-success-50",
    },
    {
      key: "inactive",
      label: "Inactive",
      icon: faTimes,
      className: "text-warning-600 hover:bg-warning-50",
    },
    {
      key: "delete",
      label: "Delete",
      icon: faTrash,
      className: "text-error-600 hover:bg-error-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    console.error('Companies error:', error);
    return (
      <>
        <Breadcrumb items={breadcrumbItems} />
        <div className="mb-4 p-4 text-theme-sm text-red-500 bg-red-50 rounded-lg">
          <h3 className="font-bold">Error loading companies:</h3>
          <p>{error.message || "Failed to fetch companies"}</p>
          <button 
            onClick={() => reloadfetchCompanies()} 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <DataTable
        data={companies}
        emptyStateMessage="No companies found"
        columns={columns}
        title="Companies"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={{
          total: companies.length,
          active: companies.filter(
            (company) => company.is_active === true || company.is_active === 1
          ).length,
          inactive: companies.filter(
            (company) => company.is_active === false || company.is_active === 0
          ).length,
        }}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate("/create-company"),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
          showIconOnly: false,
          disabled: false,
          tooltip: "Create a new company",
        }}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        searchPlaceholder="Search companies"
        enableSort={true}
        enablePagination={true}
        enableSearch={true}
        enableStatusFilter={true}
        statusFilter={statusFilter}
        statusField="is_active"
        onStatusFilterChange={setStatusFilter}
        enableSelection={true}
        onReload={reloadfetchCompanies}
        onSelectionChange={setSelectedCompanies}
        onBulkAction={handleBulkAction}
        bulkActionOptions={bulkActionOptions}
        isBulkActioning={isBulkActioning}
        isLoading={isLoading}
        getRowId={(company) => company.company_id}
      />

      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCompanyToDelete(null);
          }}
          onDelete={handleDeleteCompany}
          title="Delete Company"
          message="Are you sure you want to delete this company? This action cannot be undone."
          isLoading={isDeleting}
        />
      )}
    </>
  );
}

export default Companies;