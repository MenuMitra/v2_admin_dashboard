import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPenToSquare,
  faTrash,
  faPlus,
  faCheck,
  faXmark,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useAdmin } from "../../hooks/useAdmin";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import DataTable from "../common/DataTable";
import Breadcrumb from "../Breadcrumb";
import Modal from "../common/Modal";

function Partners() {
  const navigate = useNavigate();
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPartners, setSelectedPartners] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  // Add these states after other state declarations
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
    title: "",
    message: "",
  });

  // Add status filter state
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (adminData?.user_id) {
      fetchPartners();
    }
  }, [adminData?.user_id]);

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.get(
        `https://men4u.xyz/v2/admin/listview_partner/${adminData.user_id}`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      setPartners(response.data);

      // Calculate stats from the response
      const total = response.data.length;
      const active = response.data.filter(
        (partner) => partner.is_active === 1
      ).length;
      const inactive = total - active;

      setStats({
        total,
        active,
        inactive,
      });
    } catch (err) {
      setError("Failed to fetch partners");
      console.error("Error fetching partners:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      await axios.delete("https://men4u.xyz/v2/admin/delete_partner", {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        data: {
          partner_id: partnerToDelete.user_id,
          user_id: adminData.user_id,
        },
      });

      setIsDeleteModalOpen(false);
      setPartnerToDelete(null);
      fetchPartners(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete partner");
      console.error("Error deleting partner:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedPartners(
      checked ? partners.map((partner) => partner.user_id) : []
    );
  };

  const handleSelectPartner = (partnerId, checked) => {
    setSelectedPartners((prev) => {
      const newSelected = checked
        ? [...prev, partnerId]
        : prev.filter((id) => id !== partnerId);

      // Update selectAll state based on whether all items are selected
      setSelectAll(newSelected.length === partners.length);
      return newSelected;
    });
  };

  const getConfirmationDetails = (action) => {
    switch (action) {
      case "active":
        return {
          title: "Confirm Activation",
          message: `Are you sure you want to activate ${selectedPartners.length} selected partner(s)?`,
        };
      case "inactive":
        return {
          title: "Confirm Deactivation",
          message: `Are you sure you want to deactivate ${selectedPartners.length} selected partner(s)?`,
        };
      case "delete":
        return {
          title: "Confirm Deletion",
          message: `Are you sure you want to delete ${selectedPartners.length} selected partner(s)? This action cannot be undone.`,
        };
      default:
        return { title: "", message: "" };
    }
  };

  const showConfirmation = (action) => {
    const { title, message } = getConfirmationDetails(action);
    setConfirmModal({
      isOpen: true,
      action,
      title,
      message,
    });
    setIsActionDropdownOpen(false);
  };

  const handleBulkAction = async (action, selectedIds) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      // Show confirmation modal first
      const { title, message } = getConfirmationDetails(action);
      setConfirmModal({
        isOpen: true,
        action,
        title,
        message,
      });

      // Store selected IDs for use after confirmation
      setSelectedPartners(selectedIds.filter((id) => id !== null));
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${action} partners`);
      console.error("Error performing bulk action:", err);
    }
  };

  const executeBulkAction = async (action) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      // Ensure we have valid IDs
      const validPartnerIds = selectedPartners.filter(
        (id) => id !== null && id !== undefined
      );

      if (validPartnerIds.length === 0) {
        throw new Error("No valid partner IDs selected");
      }

      const response = await axios.post(
        "https://men4u.xyz/v2/common/bulk_partner_action",
        {
          user_id: adminData.user_id,
          action: action,
          app_source: "admin_dashboard",
          partner_ids: validPartnerIds,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response && response.status === 200) {
        setSelectedPartners([]);
        setSelectAll(false);
        setIsActionDropdownOpen(false);
        setConfirmModal({
          isOpen: false,
          action: null,
          title: "",
          message: "",
        });
        fetchPartners(); // Refresh the list
      }
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${action} partners`);
      console.error("Error performing bulk action:", err);
    }
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

  // Add this breadcrumb configuration
  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
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
      {/* Replace the manual breadcrumb with */}
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
        counts={{
          total: partners.length,
          active: partners.filter((partner) => partner.is_active === 1).length,
          inactive: partners.filter((partner) => partner.is_active === 0)
            .length,
        }}
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
        onSelectionChange={(selectedIds) => {
          setSelectedPartners(selectedIds.filter((id) => id !== null));
        }}
        onBulkAction={handleBulkAction}
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
        }}
      />

      {/* Replace the custom delete modal with the shared Modal component */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        type="error"
        title="Confirm Deletion"
        size="small"
        actionButtons={
          <>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 sm:w-auto"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 sm:w-auto"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Deleting...
                </div>
              ) : (
                "Delete Partner"
              )}
            </button>
          </>
        }
      >
        <div className="flex items-start">
          <div className="ml-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this partner? This action cannot
              be undone.
            </p>
            <p className="text-sm text-gray-500">
              All data associated with this partner will be permanently removed.
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({
            isOpen: false,
            action: null,
            title: "",
            message: "",
          })
        }
        title={confirmModal.title}
        type={confirmModal.action === "delete" ? "error" : "warning"}
        size="small"
      >
        <p className="mb-6">{confirmModal.message}</p>
        <div className="flex justify-between items-center w-full gap-3">
          <button
            onClick={() =>
              setConfirmModal({
                isOpen: false,
                action: null,
                title: "",
                message: "",
              })
            }
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={() => executeBulkAction(confirmModal.action)}
            className={`px-4 py-2 text-sm font-medium text-white rounded-full transition ${
              confirmModal.action === "delete"
                ? "bg-error-500 hover:bg-error-600"
                : "bg-warning-500 hover:bg-warning-600"
            }`}
          >
            <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
            Confirm
          </button>
        </div>
      </Modal>
    </>
  );
}

export default Partners;
