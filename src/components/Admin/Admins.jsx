import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faTrash,
  faEye,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import DataTable from "../common/DataTable";
import Breadcrumb from "../Breadcrumb";
import Modal from "../common/Modal";
import { API_CONFIG } from "../../config/appConfig";

function Admins() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const { BASE_URL, API_VERSION } = API_CONFIG;

  // Replace single number with array of protected mobile numbers
  const PROTECTED_MOBILES = [
    "8806431723",
    "9767637798",
    "8600704616",
    // Add more numbers here as needed
    // '1234567890',
    // '9876543210',
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

  // Add this breadcrumb items configuration
  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Admins", path: "/admins" },
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/admin/list_admins`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        setAdmins(response.data.data);
      } else {
        throw new Error("Failed to fetch admins");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch admins");
      console.error("Error fetching admins:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAdmin = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/delete_admin`,
        {
          admin_id: adminToDelete,
          user_id: adminData.user_id,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.detail === "Admin deleted successfully") {
        setShowDeleteModal(false);
        setAdminToDelete(null);
        // Refresh the admins list
        await fetchAdmins();
      } else {
        throw new Error("Failed to delete admin");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete admin");
      console.error("Error deleting admin:", err);
    }
  };

  // Modify handleBulkAction to remove delete case
  const handleBulkAction = async (action, selectedIds) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const endpoint = `${BASE_URL}/${API_VERSION}/common/bulk_admin_action`;
      
      // Normalize the payload to match API requirements
      const payload = {
        user_ids: selectedIds, // admin_ids -> user_ids
        action: action, // directly use "active" or "inactive"
        app_source: "admin_app"
      };

      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (response.data.detail) {
        await fetchAdmins();
        setSelectedAdmins([]);
      } else {
        throw new Error(`Failed to ${action} admins`);
      }
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${action} admins`);
      console.error(`Error performing bulk ${action}:`, err);
    }
  };

  // Add selection change handler
  const handleSelectionChange = (selectedIds) => {
    // Filter out protected admins from selection
    const filteredSelection = selectedIds.filter((id) => {
      const admin = admins.find((a) => a.user_id === id);
      return admin && !PROTECTED_MOBILES.includes(admin.mobile);
    });
    setSelectedAdmins(filteredSelection);
  };

  // Define columns for DataTable
  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
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
      field: "is_active",
      header: "Status",
      sortable: true,
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (_, admin) => {
        // Check if the admin's mobile number is in the protected list
        if (PROTECTED_MOBILES.includes(admin.mobile)) {
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => navigate(`/admin-details/${admin.user_id}`)}
                className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
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
              className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
              title="View Details"
            >
              <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/edit-admin/${admin.user_id}`)}
              className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
              title="Edit Admin"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setAdminToDelete(admin.user_id);
                setShowDeleteModal(true);
              }}
              className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
              title="Delete Admin"
            >
              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  // Add this helper function before the return statement
  const getFilteredData = () => {
    const filtered = admins.filter((admin) => {
      if (statusFilter === "all") return true;
      const isActive = admin.is_active === true || admin.is_active === 1;
      return statusFilter === "active" ? isActive : !isActive;
    });

    if (filtered.length === 0) {
      return {
        data: [],
        message: `No ${statusFilter === "all" ? "" : statusFilter} admins found.`
      };
    }

    return { data: filtered };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate counts
  const activesCount = admins.filter((admin) => admin.is_active).length;
  const inactivesCount = admins.filter((admin) => !admin.is_active).length;

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      {error && (
        <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <DataTable
        data={getFilteredData().data}
        emptyStateMessage={getFilteredData().message}
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
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
        }}
        itemsPerPage={10}
        enableSelection={true}
        onSelectionChange={handleSelectionChange}
        onBulkAction={handleBulkAction}
        isItemSelectable={(item) => !PROTECTED_MOBILES.includes(item.mobile)}
        bulkActionOptions={[
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
        ]}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setAdminToDelete(null);
        }}
        type="error"
        title="Confirm Deletion"
        size="small"
        actionButtons={
          <>
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setAdminToDelete(null);
              }}
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAdmin}
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600 sm:w-auto"
            >
              Delete Admin
            </button>
          </>
        }
      >
        <div className="flex items-start">
          <div className="ml-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this admin? This action cannot be
              undone.
            </p>
            <p className="text-sm text-gray-500">
              All data associated with this admin will be permanently removed.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Admins;
