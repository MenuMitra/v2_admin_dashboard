import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faTrash,
  faEye,
  faCircleCheck,
  faCircleXmark,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../hooks/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import DataTable from "../common/DataTable";
import Breadcrumb from "../Breadcrumb";
import { API_CONFIG } from "../../config/appConfig";
import { toastController } from "../../utils/toastController";
import { getApiErrorMessage } from "../../utils/apiError";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";
import { useAdmins } from "../../lib/react-query/hooks/useAdmins";

// Capitalize first letter of every word (title case)
const toTitleCase = (str) =>
  str
    ? str.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    : "";

function Admins() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeSessionFilter, setActiveSessionFilter] = useState("all");
  const [selectedAdmins, setSelectedAdmins] = useState([]);

  // Replace axios calls with TanStack Query hook
  const {
    admins,
    isLoading,
    error,
    deleteAdmin,
    isDeleting,
    deleteError,
    bulkAction,
    isBulkActioning,
    bulkActionError,
    updateAdmin,
    isUpdating,
    refetch: reloadfetchAdmins,
  } = useAdmins(getToken());

  // Replace single number with array of protected mobile numbers
  const PROTECTED_MOBILES = [
    "8806431723",
    "9767637798",
    "8600704616",
    "8000000000",
  ];

  // Format date helper function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Admins", path: "/admins" },
  ];

  const handleDeleteAdmin = async () => {
    try {
      await deleteAdmin(
        { adminId: adminToDelete, userId: adminData.user_id },
        {
          onSuccess: (data) => {
            setShowDeleteModal(false);
            setAdminToDelete(null);
            toastController.success(
              data.detail || "Admin deleted successfully"
            );
          },
          onError: (err) => {
            toastController.error(
              getApiErrorMessage(err, "Failed to delete admin")
            );
          },
        }
      );
    } catch (err) {
      
    }
  };

  const handleBulkAction = async (action, selectedIds) => {
    try {
      await bulkAction(
        { userIds: selectedIds, action },
        {
          onSuccess: (data) => {
            setSelectedAdmins([]);
            toastController.success(data.detail || `Bulk ${action} successful`);
          },
          onError: (err) => {
            toastController.error(
              getApiErrorMessage(err, `Failed to ${action} admins`)
            );
          },
        }
      );
    } catch (err) {
      
    }
  };

  const handleSelectionChange = (selectedIds) => {
    const filteredSelection = selectedIds.filter((id) => {
      const admin = admins.find((a) => a.user_id === id);
      return admin && !PROTECTED_MOBILES.includes(admin.mobile);
    });
    setSelectedAdmins(filteredSelection);
  };

  const handleToggleAdminActive = (admin) => {
    if (PROTECTED_MOBILES.includes(admin.mobile)) return;

    const isActive = admin.is_active === true || admin.is_active === 1;
    const nextIsActive = isActive ? 0 : 1;

    updateAdmin(
      {
        user_id: adminData?.user_id,
        admin_id: Number(admin.admin_id || admin.user_id),
        name: admin.name || "",
        email: admin.email || "",
        mobile: admin.mobile || "",
        is_active: nextIsActive,
        role: admin.role || "admin",
        app_source: "admin",
      },
      {
        onSuccess: () => {
          toastController.success(
            `Admin marked as ${nextIsActive === 1 ? "Active" : "Inactive"}`
          );
        },
        onError: (err) => {
          toastController.error(
            getApiErrorMessage(err, "Failed to update admin status")
          );
        },
      }
    );
  };

  // Define columns for DataTable
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
      field: "email",
      header: "Email",
      sortable: true,
      render: (value) => value || "-",
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
      render: (value, admin) => {
        const isActive = value === true || value === 1;
        const isProtected = PROTECTED_MOBILES.includes(admin.mobile);

        return (
          <div className="flex items-center justify-center">
            <button
              onClick={() => handleToggleAdminActive(admin)}
              disabled={isUpdating || isProtected}
              className={`text-sm font-medium transition-opacity ${
                isActive ? "text-success-600" : "text-error-600"
              } ${
                isProtected
                  ? "cursor-not-allowed"
                  : "cursor-pointer hover:opacity-80"
              } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
              title={
                isProtected
                  ? "Status cannot be changed"
                  : `Click to mark as ${isActive ? "Inactive" : "Active"}`
              }
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
      render: (_, admin) => {
        if (PROTECTED_MOBILES.includes(admin.mobile)) {
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => navigate(`/admin-details/${admin.user_id}`)}
                className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-3xl shadow-theme-xs transition"
                title="View Details"
              >
                <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
              </button>
            </div>
          );
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => navigate(`/admin-details/${admin.user_id}`)}
              className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-3xl shadow-theme-xs transition"
              title="View Details"
            >
              <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/edit-admin/${admin.user_id}`)}
              className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-3xl shadow-theme-xs transition"
              title="Edit Admin"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setAdminToDelete(admin.admin_id || admin.user_id);
                setShowDeleteModal(true);
              }}
              className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-3xl shadow-theme-xs transition"
              title="Delete Admin"
            >
              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
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
        <div className="mb-4 p-4 text-theme-sm text-red-500 bg-red-50 rounded-lg">
          {error.message || "Failed to fetch admins"}
        </div>
      )}

      <DataTable
        data={admins}
        emptyStateMessage="No admins found"
        columns={columns}
        title="Admins"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={{
          total: admins.length,
          active: admins.filter(
            (admin) => admin.is_active === true || admin.is_active === 1
          ).length,
          inactive: admins.filter(
            (admin) => admin.is_active === false || admin.is_active === 0
          ).length,
        }}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate("/create-admin"),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
          showIconOnly: false,
          disabled: false,
          tooltip: "Create a new admin",
        }}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        searchPlaceholder="Search"
        enableSort={true}
        enablePagination={true}
        enableSearch={true}
        enableStatusFilter={true}
        statusFilter={statusFilter}
        statusField="is_active"
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
        }}
        enableActiveSessionFilter={true}
        activeSessionFilter={activeSessionFilter}
        onActiveSessionFilterChange={(value) => {
          
          setActiveSessionFilter(value);
        }}
        enableSelection={true}
        onReload={reloadfetchAdmins}
        onSelectionChange={handleSelectionChange}
        onBulkAction={handleBulkAction}
        isItemSelectable={(item) => !PROTECTED_MOBILES.includes(item.mobile)}
        bulkActionOptions={[
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
        ]}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setAdminToDelete(null);
        }}
        onDelete={handleDeleteAdmin}
      />
    </>
  );
}

export default Admins;
