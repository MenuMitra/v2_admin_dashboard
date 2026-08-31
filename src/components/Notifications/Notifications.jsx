import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faShareFromSquare } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { API_CONFIG } from "../../config/appConfig";
import Breadcrumb from "../Breadcrumb";
import DataTable from "../common/DataTable";
import { useNotifications } from "../../lib/react-query/hooks/useNotifications";
import { toastController } from "../../utils/toastController";

const Notifications = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { BASE_URL } = API_CONFIG;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [resendingNotifications, setResendingNotifications] = useState(
    new Set()
  );

  const {
    notifications,
    isLoadingNotifications,
    notificationsError,
    refetchNotifications,
    outlets,
    roles,
  } = useNotifications(selectedOutlet);

  const handleOutletChange = (value) => {
    setSelectedOutlet(value);
    setSelectedRole(""); // Reset role when outlet changes
  };

  const handleRoleChange = (value) => {
    setSelectedRole(value);
  };

  // Filter notifications based on selected outlet and role
  const getFilteredNotifications = () => {
    return notifications.filter((notification) => {
      const matchesOutlet =
        !selectedOutlet ||
        notification.original_outlet_id === "0" || // Include "All" outlets
        notification.original_outlet_id === selectedOutlet; // Match specific outlet

      const matchesRole =
        !selectedRole ||
        notification.original_role === "all" || // Include "All" roles
        notification.original_role === selectedRole; // Match specific role

      return matchesOutlet && matchesRole;
    });
  };

  const columns = [
    {
      field: "outlet",
      header: "Outlet",
      sortable: true,
      render: (value, row) => (
        <button
          onClick={() =>
            row.original_outlet_id !== "0" &&
            navigate(`/view-outlet/${row.original_outlet_id}`)
          }
          className={`font-medium ${
            row.original_outlet_id !== "0"
              ? "text-brand-500 hover:text-brand-600 hover:underline cursor-pointer"
              : "text-gray-800 dark:text-white/90 cursor-default"
          }`}
        >
          {value}
        </button>
      ),
    },
    {
      field: "role",
      header: "Role",
      sortable: true,
      render: (value) => (
        <span className="capitalize font-medium text-gray-800 dark:text-white/90">
          {value}
        </span>
      ),
    },
    {
      field: "user",
      header: "User",
      sortable: true,
      render: (value, row) => (
        <button
          onClick={() =>
            row.original_user_id !== "0" &&
            navigate(`/owner-details/${row.original_user_id}`)
          }
          className={`font-medium ${
            row.original_user_id !== "0"
              ? "text-brand-500 hover:text-brand-600 hover:underline cursor-pointer"
              : "text-gray-800 dark:text-white/90 cursor-default"
          }`}
        >
          {value}
        </button>
      ),
    },
    {
      field: "title",
      header: "Message",
      sortable: true,
      render: (value) => (
        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
          {value}
        </p>
      ),
    },
    {
      field: "type",
      header: "Type",
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "Success"
              ? "bg-success-100 text-success-700"
              : value === "Info"
              ? "bg-info-100 text-info-700"
              : value === "Warning"
              ? "bg-warning-100 text-warning-700"
              : "bg-error-100 text-error-700"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      field: "success_count",
      header: "Success",
      sortable: true,
      render: (value) => (
        <span className="font-medium text-success-600">{value}</span>
      ),
    },
    {
      field: "created_on",
      header: "Sent On",
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        const day = date.getDate().toString().padStart(2, "0");
        const month = date.toLocaleString("en-US", { month: "short" });
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        hours = hours.toString().padStart(2, "0");
        const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds} ${ampm}`;

        return (
          <span className="font-medium text-gray-800 dark:text-white/90">
            {formattedDate}
          </span>
        );
      },
    },
    // Action column
    {
      field: "action",
      header: "Action",
      sortable: false,
      render: (_, row) => {
        const notificationId = row.id || row.notification_id;
        const isResending = resendingNotifications.has(notificationId);

        return (
          <button
            className={`w-8 h-8 flex items-center justify-center text-white rounded-3xl shadow-theme-xs transition ${
              isResending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-brand-500 hover:bg-brand-600"
            }`}
            onClick={() => !isResending && handleResend(row)}
            title="Resend"
            disabled={isResending}
          >
            {isResending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FontAwesomeIcon icon={faShareFromSquare} className="w-4 h-4" />
            )}
          </button>
        );
      },
    },
  ];

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Notifications" },
  ];

  const handleBulkAction = async (action, selectedIds) => {
    
  };

  // Get filtered notifications
  const filteredNotifications = getFilteredNotifications();

  const handleResend = async (notification) => {
    const notificationId = notification.id || notification.notification_id;

    if (!notificationId) {
      toastController.error("Invalid notification ID");
      return;
    }

    // Add notification to resending set to show loading state
    setResendingNotifications((prev) => new Set(prev).add(notificationId));

    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        `${BASE_URL}/common/resend_notification`,
        {
          notification_id: notificationId,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        toastController.success("Notification resent successfully!");
        // Refresh the notifications list to show the new entry
        refetchNotifications();
      }
    } catch (error) {
      
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to resend notification";
      toastController.error(errorMessage);
    } finally {
      // Remove notification from resending set
      setResendingNotifications((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <DataTable
        data={filteredNotifications}
        columns={columns}
        enablePagination={true}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[25, 50, 100, 200]}
        onItemsPerPageChange={(value) => setItemsPerPage(Number(value))}
        enableSort={true}
        enableSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        darkMode={true}
        isLoading={isLoadingNotifications}
        counts={{
          total: filteredNotifications.length,
          active: null,
          inactive: null,
        }}
        enableSelection={false}
        onBulkAction={handleBulkAction}
        onSelectionChange={setSelectedItems}
        selectedItems={selectedItems}
        title="Notifications"
        showBackButton={true}
        showSearch={true}
        searchPlaceholder="Search"
        onBackClick={() => navigate("/home")}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate("/create-notification"),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
        }}
        enableStatusFilter={false}
        showOutletSelect={true}
        outlets={outlets}
        selectedOutlet={selectedOutlet}
        onOutletChange={handleOutletChange}
        showRoleSelect={true}
        roles={roles}
        selectedRole={selectedRole}
        onRoleChange={handleRoleChange}
        onReload={refetchNotifications}
        error={notificationsError}
      />
    </>
  );
};

export default Notifications;
