import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPenToSquare,
  faTrash,
  faPlus,
  faXmark,
  faCheck,
  faToggleOff,
  faToggleOn,
  faPlay,
  faPause,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";
import DeleteConfirmModal from "./common/DeleteConfirmModal/DeleteConfirmModal";
import { useOutlets } from "../lib/react-query/hooks/useOutlets";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_CONFIG } from "../config/appConfig";
import { toastController } from "../utils/toastController";
import { queryKeys } from "../lib/react-query/queryKeys";

function Outlets() {
  const navigate = useNavigate();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const { getToken } = useAuth();

  const {
    outlets,
    isLoading,
    error,
    deleteOutlet,
    isDeleting,
    bulkAction,
    isBulkActioning,
  } = useOutlets();

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [outletToDelete, setOutletToDelete] = useState(null);
  const [selectedOutlets, setSelectedOutlets] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
    title: "",
    message: "",
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [accountType, setAccountType] = useState("all");
  const [openCloseStatus, setOpenCloseStatus] = useState("all");
  const [outletTypeFilter, setOutletTypeFilter] = useState("all");
  const [outletModeFilter, setOutletModeFilter] = useState("all");
  const [ownerCountFilter, setOwnerCountFilter] = useState("all");

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ outlet_id, type, value }) => {
      console.log("Mutation payload:", { outlet_id, type, value });
      const payload = {
        outlet_id: outlet_id,
        user_id: adminData?.user_id,
        app_source: "admin_app",
        type: type,
        value: value,
      };
      console.log("Full API payload:", payload);
      return axios.patch(
        `${BASE_URL}/${API_VERSION}/common/change_outlet_status`,
        payload,
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
    },
    onMutate: async ({ outlet_id, type, value }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(queryKeys.outlets.list());

      // Snapshot the previous value
      const previousOutlets = queryClient.getQueryData(
        queryKeys.outlets.list()
      );

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.outlets.list(), (old) => {
        if (!old) return old;
        console.log("Optimistically updating outlet data:", {
          outlet_id,
          type,
          value,
          oldData: old,
        });
        return old.map((outlet) => {
          if (outlet.outlet_id === outlet_id || outlet.id === outlet_id) {
            const updatedOutlet = { ...outlet };
            console.log("Updating outlet:", { before: outlet, type, value });
            switch (type) {
              case "outlet_status":
                updatedOutlet.outletStatus = value === "active" ? 1 : 0;
                break;
              case "is_open":
                updatedOutlet.isOpen = value === "open" ? 1 : 0;
                break;
              case "account_type":
                updatedOutlet.accountType = value;
                break;
              case "outlet_mode":
                updatedOutlet.outlet_mode = value;
                break;
            }
            console.log("Updated outlet:", updatedOutlet);
            return updatedOutlet;
          }
          return outlet;
        });
      });

      // Return a context object with the snapshotted value
      return { previousOutlets };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousOutlets) {
        queryClient.setQueryData(
          queryKeys.outlets.list(),
          context.previousOutlets
        );
      }
      toastController.error(
        err.response?.data?.message || "Failed to update status"
      );
    },
    onSuccess: (_, variables) => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries(queryKeys.outlets.list());
      const successMessages = {
        outlet_status: "Outlet status updated successfully!",
        is_open: "Open/Close status updated successfully!",
        account_type: "Account type updated successfully!",
        outlet_mode: "Outlet mode updated successfully!",
      };
      toastController.success(
        successMessages[variables.type] || "Status updated successfully!"
      );
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries(queryKeys.outlets.list());
    },
  });

  // Update the filtering logic to handle both search and status filters
  const getFilteredData = () => {
    if (!outlets.length) return [];

    return outlets.filter((item) => {
      // Status filter
      if (statusFilter !== "all") {
        const isActive = item.outletStatus === 1;
        if (statusFilter === "active" && !isActive) return false;
        if (statusFilter === "inactive" && isActive) return false;
      }
      // Account Type filter
      if (accountType !== "all") {
        if ((item.accountType || "").toLowerCase() !== accountType)
          return false;
      }
      // Open/Close filter
      if (openCloseStatus !== "all") {
        if (openCloseStatus === "open" && item.isOpen !== 1) return false;
        if (openCloseStatus === "close" && item.isOpen !== 0) return false;
      }
      // Outlet Type filter
      if (outletTypeFilter !== "all") {
        const itemOutletType = (item.outlet_type || "").toLowerCase();
        if (itemOutletType !== outletTypeFilter) return false;
      }
      // Outlet Mode filter
      if (outletModeFilter !== "all") {
        const itemOutletMode = (item.outlet_mode || "").toLowerCase();
        if (itemOutletMode !== outletModeFilter) return false;
      }
      // Owner Count filter
      if (ownerCountFilter !== "all") {
        const ownerCount = item.ownerCount || 0;
        if (ownerCountFilter === "10") {
          if (ownerCount < 10) return false;
        } else {
          const filterValue = parseInt(ownerCountFilter);
          if (ownerCount !== filterValue) return false;
        }
      }
      // Search filter
      if (searchQuery) {
        return Object.values(item).some((val) =>
          val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return true;
    });
  };

  // Use useMemo to prevent infinite re-renders
  const filteredData = useMemo(() => {
    return getFilteredData();
  }, [
    searchQuery,
    statusFilter,
    accountType,
    openCloseStatus,
    outletTypeFilter,
    outletModeFilter,
    ownerCountFilter,
    outlets,
  ]);

  // Navigation handlers
  const handleViewOutlet = (outletId) => {
    navigate(`/view-outlet/${outletId}`);
  };

  const handleEditOutlet = (outlet_id) => {
    navigate(`/edit-outlet/${outlet_id}`);
  };

  const handleDeleteClick = (outlet) => {
    setOutletToDelete(outlet);
    setShowDeleteModal(true);
  };

  const handleDeleteOutlet = async () => {
    await deleteOutlet(outletToDelete.id);
    setShowDeleteModal(false);
    setOutletToDelete(null);
  };

  // Toggle handlers for status columns
  const handleToggleOutletStatus = (outletId, currentStatus) => {
    console.log("Toggle outlet status:", { outletId, currentStatus });
    if (!outletId) {
      console.error("outletId is undefined!");
      return;
    }
    const newValue = currentStatus === 1 ? "inactive" : "active";
    toggleStatusMutation.mutate({
      outlet_id: outletId,
      type: "outlet_status",
      value: newValue,
    });
  };

  const handleToggleOpenStatus = (outletId, currentStatus) => {
    console.log("Toggle open status:", { outletId, currentStatus });
    if (!outletId) {
      console.error("outletId is undefined!");
      return;
    }
    const newValue = currentStatus === 1 ? "close" : "open";
    toggleStatusMutation.mutate({
      outlet_id: outletId,
      type: "is_open",
      value: newValue,
    });
  };

  const handleToggleAccountType = (outletId, currentType) => {
    console.log("Toggle account type:", { outletId, currentType });
    if (!outletId) {
      console.error("outletId is undefined!");
      return;
    }
    const newValue = currentType === "live" ? "test" : "live";
    console.log("Sending mutation with:", {
      outlet_id: outletId,
      type: "account_type",
      value: newValue,
    });
    toggleStatusMutation.mutate({
      outlet_id: outletId,
      type: "account_type",
      value: newValue,
    });
  };

  const handleToggleOutletMode = (outletId, currentMode) => {
    console.log("Toggle outlet mode:", { outletId, currentMode });
    if (!outletId) {
      console.error("outletId is undefined!");
      return;
    }
    const newValue = currentMode === "online" ? "offline" : "online";
    toggleStatusMutation.mutate({
      outlet_id: outletId,
      type: "outlet_mode",
      value: newValue,
    });
  };

  // Add this function to handle bulk actions
  const handleBulkAction = async (action, selectedIds) => {
    try {
      const { title, message } = getConfirmationDetails(action);
      setConfirmModal({
        isOpen: true,
        action,
        title,
        message,
      });
      setSelectedOutlets(selectedIds.filter((id) => id !== null));
    } catch (err) {
      console.error("Error preparing bulk action:", err);
    }
  };

  // Add this function to get confirmation details
  const getConfirmationDetails = (action) => {
    switch (action) {
      case "active":
        return {
          title: "Confirm Activation",
          message: `Are you sure you want to activate ${selectedOutlets.length} selected outlet(s)?`,
        };
      case "inactive":
        return {
          title: "Confirm Deactivation",
          message: `Are you sure you want to deactivate ${selectedOutlets.length} selected outlet(s)?`,
        };
      case "open":
        return {
          title: "Confirm Open",
          message: `Are you sure you want to open ${selectedOutlets.length} selected outlet(s)?`,
        };
      case "close":
        return {
          title: "Confirm Close",
          message: `Are you sure you want to close ${selectedOutlets.length} selected outlet(s)?`,
        };
      case "live":
        return {
          title: "Confirm Live Mode",
          message: `Are you sure you want to set ${selectedOutlets.length} selected outlet(s) to live mode?`,
        };
      case "test":
        return {
          title: "Confirm Test Mode",
          message: `Are you sure you want to set ${selectedOutlets.length} selected outlet(s) to test mode?`,
        };
      case "delete":
        return {
          title: "Confirm Delete",
          message: `Are you sure you want to delete ${selectedOutlets.length} selected outlet(s)? This action cannot be undone.`,
        };
      default:
        return { title: "", message: "" };
    }
  };

  // Add this function to execute bulk actions
  const executeBulkAction = async (action) => {
    const validOutletIds = selectedOutlets.filter(
      (id) => id !== null && id !== undefined
    );

    if (validOutletIds.length === 0) {
      return;
    }

    await bulkAction({ action, outletIds: validOutletIds });
    setSelectedOutlets([]);
    setConfirmModal({
      isOpen: false,
      action: null,
      title: "",
      message: "",
    });
  };

  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Outlets" },
  ];

  // Define columns for DataTable
  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col items-start">
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {value}
            <span className="pl-2 text-xs text-gray-500">({row.code})</span>
          </p>
        </div>
      ),
    },
    {
      field: "owner",
      header: "No. of Owner",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center justify-center gap-2">
          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
            {row?.ownerCount || "-"}
          </span>
        </div>
      ),
    },
    {
      field: "mobile",
      header: "Mobile",
      sortable: true,
      render: (value) => (
        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
          {value}
        </p>
      ),
    },
    {
      field: "total_order_count",
      header: "Total Orders",
      sortable: true,
      textAlign: "center",
      render: (value) => (
        <span className="text-gray-700 font-medium text-xs flex justify-center">
          {(value ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      field: "total_paid_count",
      header: "Total Paid",
      sortable: true,
      render: (value) => (
        <span className="text-gray-700 font-medium text-xs flex justify-center">
          {(value ?? 0).toLocaleString()}
        </span>
      ),
    },
    // {
    //   field: "total_cancel_count",
    //   header: "Total Cancelled ",
    //   sortable: true,
    //   render: (value) => (
    //     <span className="text-gray-700 font-medium text-xs flex justify-center">{value ?? 0}</span>
    //   ),
    // },
    {
      field: "last_order_date",
      header: "Last Order",
      sortable: true,
      render: (value) => {
        let formatted = "";
        if (value) {
          const date = new Date(value);
          if (!isNaN(date)) {
            formatted = date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
          }
        }
        return (
          <span className="text-gray-700 font-medium text-xs flex justify-center">
            {formatted || "-"}
          </span>
        );
      },
    },
    {
      field: "outlet_type",
      header: "Type",
      sortable: true,
      render: (value) => (
        <span className="text-sm font-medium text-gray-700">
          {value
            ? value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ")
            : "-"}
        </span>
      ),
    },
    {
      field: "outlet_mode",
      header: "Mode",
      sortable: true,
      render: (value, row) => (
        <button
          onClick={() => {
            console.log("Row data for outlet mode:", row);
            console.log("outlet_id from row:", row.outlet_id);
            console.log("id from row:", row.id);
            handleToggleOutletMode(row.outlet_id || row.id, value);
          }}
          disabled={toggleStatusMutation.isPending}
          className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2 ${
            value === "online"
              ? "text-brand-500 "
              : value === "offline"
              ? "bg-orange-100 text-warning-500 "
              : "bg-gray-100 text-gray-700 border-gray-200"
          } ${
            toggleStatusMutation.isPending
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <FontAwesomeIcon
            icon={value === "online" ? faToggleOn : faToggleOff}
            className={`w-4 h-4 ${
              value === "online" ? "text-brand-500" : "text-warning-500"
            }`}
          />
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : "-"}
        </button>
      ),
    },
    {
      field: "accountType",
      header: "Acc. Type",
      sortable: true,
      textAlign: "center",
      render: (value) => {
        const isLive = value?.toLowerCase() === "live";
        return (
          <div className="text-sm font-medium flex items-center gap-1">
            {isLive && (
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#10b981",
                  borderRadius: "50%",
                  animation: "blink 1.5s ease-in-out infinite",
                  display: "inline-block",
                  marginRight: "4px",
                }}
              ></div>
            )}
            <span className={isLive ? "text-success-500" : "text-warning-500"}>
              {isLive ? "Live" : "Test"}
            </span>
          </div>
        );
      },
    },
    {
      field: "isOpen",
      header: "Open \n Close",
      sortable: true,
      render: (value, row) => (
        <button
          onClick={() => {
            console.log("Row data for open/close:", row);
            console.log("outlet_id from row:", row.outlet_id);
            console.log("id from row:", row.id);
            handleToggleOpenStatus(row.outlet_id || row.id, value);
          }}
          disabled={toggleStatusMutation.isPending}
          className={`text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity ${
            value === 1 ? "text-success-500" : "text-error-500"
          } ${
            toggleStatusMutation.isPending
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {value === 1 ? "Open" : "Close"}
        </button>
      ),
    },
    {
      field: "outletStatus",
      header: "Status",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              console.log("Row data for outlet status:", row);
              console.log("outlet_id from row:", row.outlet_id);
              console.log("id from row:", row.id);
              handleToggleOutletStatus(row.outlet_id || row.id, value);
            }}
            disabled={toggleStatusMutation.isPending}
            className={`text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity ${
              value === 1 ? "text-success-500" : "text-error-500"
            } ${
              toggleStatusMutation.isPending
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {value === 1 ? "Active" : "Inactive"}
          </button>
        </div>
      ),
    },
    {
      field: "actions",
      header: "Actions",
      textAlign: "center",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleViewOutlet(row.id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditOutlet(row.id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Outlet"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Outlet"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Before return, define the new bulkActionOptions:
  const bulkActionOptions = [
    {
      key: "active",
      label: "Active",
      icon: faCheck,
      className: "text-success-700 hover:bg-gray-100",
    },
    {
      key: "inactive",
      label: "Inactive",
      icon: faXmark,
      className: "text-error-700 hover:bg-gray-100",
    },
    {
      key: "open",
      label: "Open",
      icon: faToggleOn,
      className: "text-success-600 hover:bg-success-50",
    },
    {
      key: "close",
      label: "Close",
      icon: faToggleOff,
      className: "text-error-600 hover:bg-error-50",
    },
    {
      key: "live",
      label: "Live",
      icon: faPlay,
      className: "text-success-600 hover:bg-success-50",
      customIcon: (
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 bg-success-500 rounded-full"
            style={{
              animation: "blink 1.5s ease-in-out infinite",
            }}
          ></div>
          <span>Live</span>
        </div>
      ),
    },
    {
      key: "test",
      label: "Test",
      icon: faPause,
      className: "text-warning-600 hover:bg-warning-50",
    },
    {
      key: "delete",
      label: "Delete",
      icon: faTrash,
      className: "text-error-600 hover:bg-error-50",
    },
  ];

  return (
    <>
      <style>
        {`
          @keyframes blink {
            0%, 50% {
              opacity: 1;
            }
            51%, 100% {
              opacity: 0.3;
            }
          }
        `}
      </style>
      <Breadcrumb items={breadcrumbItems} />

      <DataTable
        data={filteredData}
        columns={columns}
        title="Outlets"
        counts={{
          total: outlets.length,
          active: outlets.filter((outlet) => outlet.outletStatus === 1).length,
          inactive: outlets.filter((outlet) => outlet.outletStatus === 0)
            .length,
        }}
        searchTerm={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
        }}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate("/create-outlet"),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
        }}
        onBackClick={() => navigate(-1)}
        showBackButton={true}
        searchPlaceholder="Search outlets..."
        darkMode={false}
        enableSort={true}
        defaultSortField="created_at"
        defaultSortOrder="desc"
        enablePagination={true}
        enableSearch={true}
        enableSelection={true}
        selectedItems={selectedOutlets}
        onSelectionChange={(selectedIds) => {
          setSelectedOutlets(selectedIds.filter((id) => id !== null));
        }}
        onBulkAction={handleBulkAction}
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
        }}
        enableAccountTypeFilter={true}
        enableOpenCloseStatusFilter={true}
        accountType={accountType}
        onAccountTypeChange={(e) => setAccountType(e.target.value)}
        openCloseStatus={openCloseStatus}
        onOpenCloseStatusChange={(e) => setOpenCloseStatus(e.target.value)}
        enableOutletTypeFilter={true}
        outletTypeFilter={outletTypeFilter}
        onOutletTypeFilterChange={(value) => setOutletTypeFilter(value)}
        enableOutletModeFilter={true}
        outletModeFilter={outletModeFilter}
        onOutletModeFilterChange={(value) => setOutletModeFilter(value)}
        enableOwnerCountFilter={true}
        ownerCountFilter={ownerCountFilter}
        onOwnerCountFilterChange={(value) => setOwnerCountFilter(value)}
        statusField="outletStatus"
        onReload={() => {
          queryClient.invalidateQueries(queryKeys.outlets.list());
          console.log("Forcing outlets data refresh");
        }}
        isItemSelectable={(item) => {
          if (statusFilter === "all") return true;
          return statusFilter === "active"
            ? item.outletStatus === 1
            : item.outletStatus === 0;
        }}
        emptyStateMessage={
          searchQuery
            ? "No outlets found matching your search criteria."
            : statusFilter !== "all"
            ? `No ${statusFilter} outlets found.`
            : "No outlets available."
        }
        isLoading={
          isLoading ||
          isDeleting ||
          isBulkActioning ||
          toggleStatusMutation.isPending
        }
        bulkActionOptions={bulkActionOptions}
      />

      {/* Modal for all bulk actions except delete */}
      {confirmModal.isOpen && confirmModal.action !== "delete" && (
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
          type="warning"
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
              className="px-4 py-2 text-sm font-medium text-white rounded-full transition bg-warning-500 hover:bg-warning-600"
            >
              <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
              Confirm
            </button>
          </div>
        </Modal>
      )}

      {/* DeleteConfirmModal for bulk delete only */}
      <DeleteConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.action === "delete"}
        onClose={() =>
          setConfirmModal({
            isOpen: false,
            action: null,
            title: "",
            message: "",
          })
        }
        onDelete={() => executeBulkAction("delete")}
      />

      {/* Delete Modal using DeleteConfirmModal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setOutletToDelete(null);
        }}
        onDelete={handleDeleteOutlet}
        title="Confirm Delete"
        message={"Are you sure ?"}
      />
    </>
  );
}

export default Outlets;
