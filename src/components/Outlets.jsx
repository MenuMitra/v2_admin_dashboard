import React, { useState, useEffect } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";
import DeleteConfirmModal from './common/DeleteConfirmModal/DeleteConfirmModal';
import { useOutlets } from "../lib/react-query/hooks/useOutlets";

function Outlets() {
  const navigate = useNavigate();
  const { adminData } = useAdmin();
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
  const [filteredData, setFilteredData] = useState([]);
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
        if ((item.accountType || '').toLowerCase() !== accountType) return false;
      }
      // Open/Close filter
      if (openCloseStatus !== "all") {
        if (openCloseStatus === "open" && item.isOpen !== 1) return false;
        if (openCloseStatus === "close" && item.isOpen !== 0) return false;
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

  // Update filtered data when filters or data changes
  useEffect(() => {
    const filtered = getFilteredData();
    setFilteredData(filtered);
  }, [searchQuery, statusFilter, accountType, openCloseStatus, outlets]);

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
          <span className="pl-2 text-xs text-gray-500">
            ({row.code})
          </span>
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
        <span className="text-gray-700 font-medium text-xs flex justify-center">{value ?? 0}</span>
      ),
    },
    {
      field: "total_paid_count",
      header: "Total Paid",
      sortable: true,
      render: (value) => (
        <span className="text-gray-700 font-medium text-xs flex justify-center">{value ?? 0}</span>
      ),
    },
    {
      field: "total_cancel_count",
      header: "Total Cancelled ",
      sortable: true,
      render: (value) => (
        <span className="text-gray-700 font-medium text-xs flex justify-center">{value ?? 0}</span>
      ),
    },
    {
      field: "total_menu",
      header: "Total Menus",
      sortable: true,
      render: (value) => (
        <span className="text-gray-700 font-medium text-xs flex justify-center">{value ?? 0}</span>
      ),
    },
    {
      field: "accountType",
      header: "Acc. Type",
      sortable: true,
      render: (value) => (
        <span className={`text-sm font-medium ${
          value?.toLowerCase() === "live"
            ? "text-success-500"
            : "text-warning-500"
        }`}>
          {value?.toLowerCase() === "live" ? "Live" : "Test"}
        </span>
      ),
    },
    {
      field: "isOpen",
      header: "Open \n Close",
      sortable: true,
      render: (value) => (
        <span className={`text-sm font-medium ${
          value === 1 ? "text-success-500" : "text-error-500"
        }`}>
          {value === 1 ? "Open" : "Close"}
        </span>
      ),
    },
    {
      field: "outletStatus",
      header: "Status",
      sortable: true,
      render: (value) => (
        <div className="flex items-center justify-center gap-2">
          <span
            className={`text-sm font-medium ${
              value === 1 ? "text-success-500" : "text-error-500"
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

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
     
      <DataTable
        data={filteredData}
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
        onAccountTypeChange={e => setAccountType(e.target.value)}
        openCloseStatus={openCloseStatus}
        onOpenCloseStatusChange={e => setOpenCloseStatus(e.target.value)}
        statusField="outletStatus"
        onReload={() => queryClient.invalidateQueries(queryKeys.outlets.list())}
        isItemSelectable={(item) => {
          if (statusFilter === "all") return true;
          return statusFilter === "active" ? 
            item.outletStatus === 1 : 
            item.outletStatus === 0;
        }}
        emptyStateMessage={
          searchQuery
            ? "No outlets found matching your search criteria."
            : statusFilter !== "all"
            ? `No ${statusFilter} outlets found.`
            : "No outlets available."
        }
        isLoading={isLoading || isDeleting || isBulkActioning}
      />

      {/* Modal for active/inactive actions only */}
      {confirmModal.isOpen && confirmModal.action !== 'delete' && (
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
        isOpen={confirmModal.isOpen && confirmModal.action === 'delete'}
        onClose={() =>
          setConfirmModal({
            isOpen: false,
            action: null,
            title: "",
            message: "",
          })
        }
        onDelete={() => executeBulkAction('delete')}
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
