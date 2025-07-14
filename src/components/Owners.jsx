import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faFilter,
  faEye,
  faPenToSquare,
  faTrash,
  faExclamationTriangle,
  faArrowRight,
  faSort,
  faSortUp,
  faSortDown,
  faChevronLeft,
  faChevronRight,
  faSearch,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from './Breadcrumb';
import TablesViewHeader from './common/TablesViewHeader';
import DataTable from './common/DataTable';
import Modal from './common/Modal';
import { API_CONFIG } from "../config/appConfig";
import { toastController } from "../utils/toastController";

function Owners() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [owners, setOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortCount, setSortCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  const { BASE_URL, API_VERSION } = API_CONFIG;

  useEffect(() => {
    if (adminData?.user_id) {
      fetchOwners();
    }
  }, [adminData?.user_id]);

  const fetchOwners = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await toastController.promise(
        axios.get(
          `${BASE_URL}/${API_VERSION}/common/listview_owner/${adminData.user_id}`,
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        ),
        {
          loading: 'Loading owners...',
          success: 'Owners loaded successfully!',
          error: 'Failed to load owners'
        }
      );

      setOwners(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching owners:", error);
      setIsLoading(false);
    }
  };

  const handleViewOwner = (owner_id) => {
    navigate(`/owner-details/${owner_id}`);
  };

  const handleEditOwner = (owner_id) => {
    navigate(`/edit-owner/${owner_id}`);
  };

  const handleDeleteOwner = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      await toastController.promise(
        axios.delete(`${BASE_URL}/${API_VERSION}/common/delete_owner`, {
          data: {
            owner_id: ownerToDelete,
            user_id: adminData.user_id,
          },
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }),
        {
          loading: 'Deleting owner...',
          success: 'Owner deleted successfully!',
          error: 'Failed to delete owner'
        }
      );

      setShowDeleteModal(false);
      setOwnerToDelete(null);
      fetchOwners();
    } catch (error) {
      console.error("Error deleting owner:", error);
    }
  };

  const openDeleteModal = (owner_id) => {
    setOwnerToDelete(owner_id);
    setShowDeleteModal(true);
  };

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

  const getSortedOwners = () => {
    let filteredOwners = owners;

    // First apply search filter
    if (searchTerm) {
      filteredOwners = owners.filter(
        (owner) =>
          owner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          owner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          owner.mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          owner.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Then apply sorting
    if (!sortField) return filteredOwners;

    return [...filteredOwners].sort((a, b) => {
      let aValue = a[sortField] || "";
      let bValue = b[sortField] || "";

      if (sortField === "is_active") {
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = getSortedOwners().slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(getSortedOwners().length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7; // Show max 7 page numbers
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxVisiblePages) {
      const middlePage = Math.floor(maxVisiblePages / 2);
      if (currentPage <= middlePage) {
        endPage = maxVisiblePages;
      } else if (currentPage + middlePage >= totalPages) {
        startPage = totalPages - maxVisiblePages + 1;
      } else {
        startPage = currentPage - middlePage;
        endPage = currentPage + middlePage;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i}>
          <button
            onClick={() => handlePageChange(i)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${
              currentPage === i
                ? "bg-brand-500 text-white"
                : "text-gray-700 hover:bg-brand-500 hover:text-white dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            {i}
          </button>
        </li>
      );
    }

    // Add ellipsis if needed
    if (startPage > 1) {
      pages.unshift(
        <li key="start-ellipsis">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 dark:text-gray-400">
            ...
          </span>
        </li>
      );
    }
    if (endPage < totalPages) {
      pages.push(
        <li key="end-ellipsis">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 dark:text-gray-400">
            ...
          </span>
        </li>
      );
    }

    return pages;
  };

  const getTotalCount = () => owners.length;
  const getActiveCount = () =>
    owners.filter((owner) => owner.is_active === 1).length;
  const getInactiveCount = () =>
    owners.filter((owner) => owner.is_active === 0).length;

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Owners' }
  ];

  const columns = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      render: (value) => (
        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
          {value}
        </p>
      ),
    },
    
    {
      field: "mobile",
      header: "Mobile",
      sortable: true,
    },
    {
      field: "outlet_count",
      header: "Outlets",
      sortable: true,
      render: (value) => (
        <div className="text-center">
          <span className="px-2 py-1 text-sm font-medium text-gray-800 dark:text-white/90">
            {value || 0}
          </span>
        </div>
      ),
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
        </div>
      )
    },
    {
      field: "account_type",
      header: "Account Type",
      sortable: true,
      render: (value) => (
        <span
          className={`inline-block px-2 py-1 text-xs ${
            value === "live"
              ? "text-error-600"
              : "text-success-600"
          }`}
        >
          {value?.toUpperCase()}
        </span>
      ),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (_, owner) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleViewOwner(owner.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditOwner(owner.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Owner"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(owner.user_id)}
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Owner"
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleBulkAction = async (action, selectedIds) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/common/bulk_owner_action`,
          {
            user_id: adminData.user_id,
            action: action,
            app_source: "admin_app",
            owner_ids: selectedIds
          },
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        ),
        {
          loading: 'Processing bulk action...',
          success: 'Bulk action completed successfully!',
          error: 'Failed to process bulk action'
        }
      );

      setSelectedItems([]);
      fetchOwners();
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  // Add delete modal buttons
  const deleteModalButtons = (
    <>
      <button
        type="button"
        onClick={() => {
          setShowDeleteModal(false);
          setOwnerToDelete(null);
        }}
        className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleDeleteOwner}
        className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-error-500 px-4 py-3 font-medium text-white hover:bg-error-600"
      >
        Delete Owner
      </button>
    </>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <DataTable
        data={owners}
        columns={columns}
        enablePagination={true}
        itemsPerPage={itemsPerPage}
        itemsPerPageOptions={[50, 100, 200]}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(Number(value));
          setCurrentPage(1);
        }}
        enableSort={true}
        enableAccountTypeFilter={false}
        enableSearch={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        darkMode={true}
        
        // Enable selection and bulk actions
        enableSelection={true}
        onBulkAction={handleBulkAction}
        onSelectionChange={setSelectedItems}
        selectedItems={selectedItems}
        
        // Header props
        title="Owners"
        counts={{
          total: getTotalCount(),
          active: getActiveCount(),
          inactive: getInactiveCount()
        }}
        showBackButton={true}
        showSearch={true}
        searchPlaceholder="Search"
        onBackClick={() => navigate("/dashboard")}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate("/create-owner"),
          className: "bg-success-500 hover:bg-success-600",
          position: "right"
        }}
        
        // Add status filter props
      
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setCurrentPage(1);
        }}
        onReload={fetchOwners}
      />

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setOwnerToDelete(null);
        }}
        title="Confirm Deletion"
        type="error"
        size="small"
        actionButtons={deleteModalButtons}
      >
        <div className="flex flex-col items-center space-y-4">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="h-8 w-8 text-error-500"
          />
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this owner? <br/>
            This action cannot be undone. All data associated with this owner
            will be permanently removed.
          </p>
        </div>
      </Modal>
    </>
  );
}

export default Owners;
