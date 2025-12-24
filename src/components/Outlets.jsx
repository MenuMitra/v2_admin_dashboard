import React, { useState } from "react";
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
import DeleteConfirmModal from "./common/DeleteConfirmModal/DeleteConfirmModal";
import { useOutlets } from "../lib/react-query/hooks/useOutlets";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_CONFIG } from "../config/appConfig";
import { toastController } from "../utils/toastController";
import { queryKeys } from "../lib/react-query/queryKeys";

// Capitalize first letter of every word (title case)
const toTitleCase = (str) =>
  str
    ? str.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    : "";

function Outlets() {
  const navigate = useNavigate();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const { getToken } = useAuth();

  const { outlets, isLoading, deleteOutlet, isDeleting, bulkAction, isBulkActioning } =
    useOutlets();

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [outletToDelete, setOutletToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [accountType, setAccountType] = useState("all");
  const [openCloseStatus, setOpenCloseStatus] = useState("all");
  const [outletTypeFilter, setOutletTypeFilter] = useState("all");
  const [outletModeFilter, setOutletModeFilter] = useState("all");
  const [ownerCountFilter, setOwnerCountFilter] = useState("all");

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ outlet_id, type, value }) => {
      
      const payload = {
        outlet_id: outlet_id,
        user_id: adminData?.user_id,
        app_source: "admin_app",
        type: type,
        value: value,
      };
      
      return axios.patch(
        `${BASE_URL}/common/change_outlet_status`,
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
        
        return old.map((outlet) => {
          if (outlet.outlet_id === outlet_id || outlet.id === outlet_id) {
            const updatedOutlet = { ...outlet };
            
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
    
    if (!outletId) {
      
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
    
    if (!outletId) {
      
      return;
    }
    const newValue = currentStatus === 1 ? "close" : "open";
    toggleStatusMutation.mutate({
      outlet_id: outletId,
      type: "is_open",
      value: newValue,
    });
  };

  const handleToggleOutletMode = (outletId, currentMode) => {
    
    if (!outletId) {
      
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
  const handleBulkAction = (action, selectedIds = []) => {
    const validIds = selectedIds.filter(
      (id) => id !== null && id !== undefined && id !== ""
    );
    if (validIds.length === 0) {
      toastController.warning("Select at least one outlet to continue.");
      return;
    }

    bulkAction({ action, outletIds: validIds });
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
      render: (value, row) => {
        // Check if outlet name contains "Expiring Soon" and extract it
        const isExpiringSoon = value && value.includes(" - Expiring Soon");
        const displayName = isExpiringSoon
          ? value.replace(" - Expiring Soon", "")
          : value;

        return (
          <div className="flex flex-col items-start">
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {toTitleCase(displayName)}
              <span className="pl-2 text-xs text-gray-500">({row.code})</span>
              {isExpiringSoon && (
                <span className="pl-2 text-xs text-error-500 font-medium">
                  Expiring Soon
                </span>
              )}
            </p>
          </div>
        );
      },
    },
    {
      field: "owner",
      header: "No. of Owner",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center justify-center gap-2">
          {row?.ownerCount && Number(row.ownerCount) > 0 ? (
            <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
              {row.ownerCount}
            </span>
          ) : (
            <span className="font-medium text-error-500 text-theme-xs">
              NO OWNER ASSIGNED
            </span>
          )}
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
                className="w-2 h-2 bg-[#10b981] rounded-full inline-block mr-1 animate-[blink_1.5s_ease-in-out_infinite]"
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
      sticky: true,
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleViewOutlet(row.id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-3xl shadow-theme-xs transition"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditOutlet(row.id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-3xl shadow-theme-xs transition"
            title="Edit Outlet"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-3xl shadow-theme-xs transition"
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
            className="w-2 h-2 bg-success-500 rounded-full animate-[blink_1.5s_ease-in-out_infinite]"
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
    <div className="outlets-page">
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
        data={outlets}
        columns={columns}
        title="Outlets"
        counts={{
          total: outlets.length,
          active: outlets.filter((outlet) => outlet.outletStatus === 1).length,
          inactive: outlets.filter((outlet) => outlet.outletStatus === 0).length,
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
        onBulkAction={handleBulkAction}
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
        }}
        enableAccountTypeFilter={true}
        enableOpenCloseStatusFilter={true}
        accountType={accountType}
        onAccountTypeChange={(value) => setAccountType(value)}
        openCloseStatus={openCloseStatus}
        onOpenCloseStatusChange={(value) => setOpenCloseStatus(value)}
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
        }}
        isItemSelectable={(item) => {
          if (statusFilter === "all") return true;
          return statusFilter === "active"
            ? item.outletStatus === 1
            : item.outletStatus === 0;
        }}
        emptyStateMessage="No outlets found"
        isLoading={
          isLoading ||
          isDeleting ||
          isBulkActioning ||
          toggleStatusMutation.isPending
        }
        bulkActionOptions={bulkActionOptions}
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
    </div>
  );
}

export default Outlets;