import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import brand02 from "../assets/images/brand/brand-02.svg";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPenToSquare,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faPlus,
  faSearch,
  faSort,
  faSortUp,
  faSortDown,
  faXmark,
  faCheck,
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";
import { API_CONFIG} from "../config/appConfig";
import { toastController } from "../utils/toastController";




function Outlets() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [outletData, setOutletData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [outletToDelete, setOutletToDelete] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortCount, setSortCount] = useState(0);
  const [selectedOutlets, setSelectedOutlets] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
    title: "",
    message: "",
  });
  const [statusFilter, setStatusFilter] = useState("all");

  const { BASE_URL, API_VERSION } = API_CONFIG;

  // Transform outlet data to match UI structure
  const transformOutletData = (outlets) => {
    return outlets.map((outlet) => ({
      id: outlet.outlet_id,
      user_id: outlet.outlet_id,
      name: outlet.outlet_name,
      code: outlet.outlet_code,
      mobile: outlet.mobile,
      status: getOutletStatus(outlet.outlet_status, outlet.is_open),
      isOpen: outlet.is_open,
      outletStatus: outlet.outlet_status,
      image: [{}],
      accountType: outlet.account_type,
      ownerCount: outlet.owner_count,
    }));
  };

  // Helper function to determine status
  const getOutletStatus = (outlet_status, is_open) => {
    if (outlet_status === 1 && is_open === 1) return "success";
    if (outlet_status === 1 && is_open === 0) return "pending";
    return "failed";
  };

  // Fetch outlets from API
  const fetchOutlets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/common/listview_outlet`,
          {
            user_id: adminData?.user_id,
            app_source: "admin_dashboard",
          },
          {
            headers: {
              Authorization: getToken(),
              "Content-Type": "application/json",
            },
          }
        ),
        {
          loading: 'Loading outlets...',
          success: 'Successfully loaded outlets!',
          error: 'Failed to load outlets'
        }
      );

      if (response.data.detail === "Successfully retrieved outlets") {
        const transformedData = transformOutletData(response.data.data);
        setOutletData(transformedData);
        setFilteredData(transformedData);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch outlets");
      console.error("Error fetching outlets:", err);
    } finally {
      setLoading(false);
    }
  };

  // Call API when component mounts
  useEffect(() => {
    if (adminData?.user_id) {
      fetchOutlets();
    }
  }, [adminData?.user_id]);

  // Update the filtering logic to handle both search and status filters
  const getFilteredData = () => {
    if (!outletData.length) return [];

    return outletData.filter((item) => {
      // First apply status filter
      if (statusFilter !== "all") {
        const isActive = item.outletStatus === 1;
        if (statusFilter === "active" && !isActive) return false;
        if (statusFilter === "inactive" && isActive) return false;
      }

      // Then apply search filter if there's a search query
      if (searchQuery) {
        return Object.values(item).some((val) =>
          val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return true;
    });
  };

  // Update the useEffect for filtering
  useEffect(() => {
    const filtered = getFilteredData();
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, statusFilter, outletData]);

  // Get current items
  const getCurrentItems = () => {
    const sortedData = getSortedOutlets();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  };

  // Calculate total pages based on filtered data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Update table headers
  const tableHeaders = [
    { label: "Outlet Name", key: "name" },
    { label: "Outlet Code", key: "code" },
    { label: "Mobile", key: "mobile" },
    { label: "Account Type", key: "accountType" },
    { label: "Open/Close", key: "isOpen" },
    { label: "Status", key: "outletStatus" },
    { label: "Actions", key: "actions" },
  ];

  // Add this function to handle view button click
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
    try {
      setLoading(true);
      const response = await toastController.promise(
        axios.delete(
          `${BASE_URL}/${API_VERSION}/common/delete_outlet`,
          {
            headers: {
              Authorization: getToken(),
              "Content-Type": "application/json",
            },
            data: {
              outlet_id: outletToDelete.id,
              user_id: adminData?.user_id,
            },
          }
        ),
        {
          loading: 'Deleting outlet...',
          success: 'Outlet deleted successfully!',
          error: 'Failed to delete outlet'
        }
      );

      if (response.data.detail === "Outlet deleted successfully") {
        setShowDeleteModal(false);
        fetchOutlets();
      }
    } catch (err) {
      console.error("Error deleting outlet:", err);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Outlets" },
  ];

  const handleSort = (field) => {
    if (sortField === field) {
      if (sortCount === 0) {
        setSortOrder("asc");
        setSortCount(1);
      } else if (sortCount === 1) {
        setSortOrder("desc");
        setSortCount(2);
      } else {
        setSortField(null);
        setSortOrder("asc");
        setSortCount(0);
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
      setSortCount(1);
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <FontAwesomeIcon icon={faSort} className="ml-1 text-gray-400 w-4 h-4" />
      );
    }
    return sortOrder === "asc" ? (
      <FontAwesomeIcon
        icon={faSortUp}
        className="ml-1 text-brand-500 w-4 h-4"
      />
    ) : (
      <FontAwesomeIcon
        icon={faSortDown}
        className="ml-1 text-brand-500 w-4 h-4"
      />
    );
  };

  const getSortedOutlets = () => {
    let sorted = [...filteredData];

    if (!sortField) return sorted;

    return sorted.sort((a, b) => {
      let aValue = a[sortField] || "";
      let bValue = b[sortField] || "";

      if (sortField === "outletStatus" || sortField === "isOpen") {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Define columns for DataTable
  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      render: (value, row) => (
        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
          {value}
        </p>
      ),
    },
    {
      field: "owner",
      header: "Owner",
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
      field: "code",
      header: "Code",
      sortable: true,
      render: (value) => (
        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
          {value}
        </p>
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
      field: "accountType",
      header: "Acc. Type",
      sortable: true,
      render: (value) => (
        <>
          <FontAwesomeIcon
            icon={
              value?.toLowerCase() === "live"
                ? faCircleCheck
                : faTriangleExclamation
            }
            className={`w-4 h-4 ${
              value?.toLowerCase() === "live"
                ? "text-success-500"
                : "text-warning-500"
            }`}
          />
        </>
      ),
    },
    {
      field: "isOpen",
      header: "Open/Close",
      sortable: true,
      render: (value) => (
        <span
          className={`inline-block px-2 py-1 text-xs ${
            value === 1
              ? "bg-success-100 text-success-600"
              : "bg-error-100 text-error-500"
          }`}
        >
          {value === 1 ? "Open" : "Closed"}
        </span>
      ),
    },
    {
      field: "outletStatus",
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
          {/* <span
            className={`text-base font-medium ${
              value === 1 ? "text-success-700" : "text-error-700"
            }`}
          >
            {value === 1 ? "Active" : "Inactive"}
          </span> */}
        </div>
      ),
    },
    {
      field: "actions",
      header: "Actions",
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

  // Add this function to handle bulk actions
  const handleBulkAction = async (action, selectedIds) => {
    try {
      // Show confirmation modal first
      const { title, message } = getConfirmationDetails(action);
      setConfirmModal({
        isOpen: true,
        action,
        title,
        message,
      });

      // Store selected IDs for use after confirmation
      setSelectedOutlets(selectedIds.filter((id) => id !== null));
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${action} outlets`);
      console.error("Error performing bulk action:", err);
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
          title: "Confirm Deletion",
          message: `Are you sure you want to delete ${selectedOutlets.length} selected outlet(s)? This action cannot be undone.`,
        };
      default:
        return { title: "", message: "" };
    }
  };

  // Add this function to execute bulk actions
  const executeBulkAction = async (action) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const validOutletIds = selectedOutlets.filter(
        (id) => id !== null && id !== undefined
      );

      if (validOutletIds.length === 0) {
        throw new Error("No valid outlet IDs selected");
      }

      const response = await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/common/bulk_outlet_action`,
          {
            user_id: adminData.user_id,
            action: action,
            app_source: "admin_dashboard",
            outlet_ids: validOutletIds,
          },
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        ),
        {
          loading: `${action === 'delete' ? 'Deleting' : action === 'active' ? 'Activating' : 'Deactivating'} outlets...`,
          success: `Successfully ${action === 'delete' ? 'deleted' : action === 'active' ? 'activated' : 'deactivated'} outlets!`,
          error: `Failed to ${action} outlets`
        }
      );

      if (response && response.status === 200) {
        setSelectedOutlets([]);
        setConfirmModal({
          isOpen: false,
          action: null,
          title: "",
          message: "",
        });
        await fetchOutlets();
      }
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${action} outlets`);
      console.error("Error performing bulk action:", err);
      toastController.error(`Failed to ${action} outlets: ${err.message}`);
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      {error && (
        <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}
      <DataTable
        data={filteredData}
        columns={columns}
        title="Outlets"
        counts={{
          total: outletData.length,
          active: outletData.filter((outlet) => outlet.outletStatus === 1).length,
          inactive: outletData.filter((outlet) => outlet.outletStatus === 0).length,
        }}
        searchTerm={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1); // Reset page when search changes
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
          setCurrentPage(1); // Reset page when status filter changes
        }}
        statusField="outletStatus" // Specify which field to use for status
        isItemSelectable={(item) => {
          // Add logic to determine if an item can be selected based on its status
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
      />

      {/* Add Modal component for confirmations */}
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

      {/* Delete Modal - Keep existing implementation */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setOutletToDelete(null);
        }}
        title="Confirm Deletion"
        type="error"
        size="small"
        customIcon={
          <FontAwesomeIcon icon={faTrash} className="h-6 w-6 text-error-500" />
        }
        actionButtons={
          <>
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setOutletToDelete(null);
              }}
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteOutlet}
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-error-500 px-4 py-3 font-medium text-white hover:bg-error-600"
            >
              Delete Outlet
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Are you sure you want to delete outlet "{outletToDelete?.name}"? This
          action cannot be undone.
          <br />
          All data associated with this outlet will be permanently removed.
        </p>
      </Modal>
    </>
  );
}

export default Outlets;
