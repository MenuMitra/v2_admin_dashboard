import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import brand02 from "../assets/images/brand/brand-02.svg";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';
import DataTable from './common/DataTable';
import Modal from './common/Modal';


const SearchIcon = () => (
  <svg
    className="fill-gray-500 dark:fill-gray-400"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z"
      fill="currentColor"
    />
  </svg>
);

const MoreIcon = () => (
  <svg
    className="fill-current"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.99902 10.245C6.96552 10.245 7.74902 11.0285 7.74902 11.995V12.005C7.74902 12.9715 6.96552 13.755 5.99902 13.755C5.03253 13.755 4.24902 12.9715 4.24902 12.005V11.995C4.24902 11.0285 5.03253 10.245 5.99902 10.245ZM17.999 10.245C18.9655 10.245 19.749 11.0285 19.749 11.995V12.005C19.749 12.9715 18.9655 13.755 17.999 13.755C17.0325 13.755 16.249 12.9715 16.249 12.005V11.995C16.249 11.0285 17.0325 10.245 17.999 10.245ZM13.749 11.995C13.749 11.0285 12.9655 10.245 11.999 10.245C11.0325 10.245 10.249 11.0285 10.249 11.995V12.005C10.249 12.9715 11.0325 13.755 11.999 13.755C12.9655 13.755 13.749 12.9715 13.749 12.005V11.995Z"
      fill="currentColor"
    />
  </svg>
);

const StatusBadge = ({ status }) => {
  const statusClasses = {
    success:
      "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
    pending:
      "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400",
    failed:
      "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
  };

  return (
    <p
      className={`${statusClasses[status]} text-theme-xs rounded-full px-2 py-0.5 font-medium`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </p>
  );
};

const TableRow = ({ outlet, handleViewOutlet, handleEditOutlet, onDeleteClick }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  console.log(outlet);
  console.log(handleViewOutlet);

  return (
    <tr>
      <td className="py-3 pr-5 whitespace-nowrap sm:pr-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-theme-sm block font-medium text-gray-700 dark:text-gray-400">
                {outlet.name}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3 whitespace-nowrap sm:px-6">
        <div className="flex items-center justify-center">
          <p className="text-theme-sm text-gray-700 dark:text-gray-400">
            {outlet.code}
          </p>
        </div>
      </td>
      <td className="px-5 py-3 whitespace-nowrap sm:px-6">
        <div className="flex items-center justify-center">
          <p className="text-theme-sm text-gray-700 dark:text-gray-400">
            {outlet.mobile}
          </p>
        </div>
      </td>
      <td className="px-5 py-3 whitespace-nowrap sm:px-6">
        <div className="flex items-center justify-center">
          <p className="text-theme-sm text-gray-700 dark:text-gray-400">
            {outlet.accountType.charAt(0).toUpperCase() + outlet.accountType.slice(1)}
          </p>
        </div>
      </td>
      <td className="px-5 py-3 whitespace-nowrap sm:px-6">
        <div className="flex items-center justify-center">
          <p className={`text-theme-sm rounded-full px-2 py-0.5 font-medium ${
            outlet.isOpen === 1 
              ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
              : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500'
          }`}>
            {outlet.isOpen === 1 ? 'Open' : 'Close'}
          </p>
        </div>
      </td>
      <td className="px-5 py-3 whitespace-nowrap sm:px-6">
        <div className="flex items-center justify-center">
          <p className={`text-theme-sm rounded-full px-2 py-0.5 font-medium ${
            outlet.outletStatus === 1 
              ? 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
              : 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500'
          }`}>
            {outlet.outletStatus === 1 ? 'Active' : 'Inactive'}
          </p>
        </div>
      </td>
      <td className="px-5 py-3 whitespace-nowrap sm:px-6">
        <div className="flex items-center justify-center gap-2">
          {/* View Button - Blue */}
          <button 
            className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
            title="View Details"
            onClick={() => handleViewOutlet(outlet.id)}
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
          </button>

          {/* Edit Button - Yellow/Warning */}
          <button 
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
            title="Edit Outlet"
            onClick={() => handleEditOutlet(outlet.id)}
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
          </button>

          {/* Delete Button - Red */}
          <button 
            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            title="Delete Outlet"
            onClick={() => onDeleteClick(outlet)}
          >
            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange, totalEntries, itemsPerPage }) => {
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
            onClick={() => onPageChange(i)}
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

  // Calculate the range of entries being shown
  const startEntry = ((currentPage - 1) * itemsPerPage) + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, totalEntries);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-4">
      <div className="text-gray-500 text-theme-sm dark:text-gray-400">
        Showing {startEntry} to {endEntry} of {totalEntries} entries
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-normal">
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
        </button>

        <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 sm:hidden">
          Page {currentPage} of {totalPages}
        </span>

        <ul className="hidden items-center gap-0.5 sm:flex">
          {renderPaginationNumbers()}
        </ul>

        <button
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

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
    title: '',
    message: ''
  });
  const [statusFilter, setStatusFilter] = useState('all');

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

      const response = await axios.post(
        "https://men4u.xyz/v2/common/listview_outlet",
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
      );

      if (response.data.detail === "Successfully retrieved outlets") {
        const transformedData = transformOutletData(response.data.data);
        setOutletData(transformedData);
        setFilteredData(transformedData); // Initialize filtered data with all outlets
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

  // Handle search
  useEffect(() => {
    if (!outletData.length) return;

    const filtered = outletData.filter((item) =>
      Object.values(item).some((val) =>
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when searching
  }, [searchQuery, outletData]);

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
      const response = await axios.delete(
        "https://men4u.xyz/v2/common/delete_outlet",
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
      );

      if (response.data.detail === "Outlet deleted successfully") {
        setShowDeleteModal(false);
        fetchOutlets(); // Refresh the outlets list
      }
    } catch (err) {
      console.error("Error deleting outlet:", err);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Outlets' }
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
      return <FontAwesomeIcon icon={faSort} className="ml-1 text-gray-400 w-4 h-4" />;
    }
    return sortOrder === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="ml-1 text-brand-500 w-4 h-4" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="ml-1 text-brand-500 w-4 h-4" />
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
      )
    },
    {
      field: "owner",
      header: "Owner",
      sortable: true,
      render: (value, row) => (
        row?.owner_id ? (
          <Link to={`/owner/${row.owner_id}`} className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
            {row?.owner || "-"}
          </Link>
        ) : (
          <p className="text-gray-500 text-theme-sm dark:text-gray-400">
            {row?.owner || "-"}
          </p>
        )
      )
    },
    {
      field: "code",
      header: "Code",
      sortable: true,
      render: (value) => (
        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
          {value}
        </p>
      )
    },
    {
      field: "mobile",
      header: "Mobile",
      sortable: true,
      render: (value) => (
        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
          {value}
        </p>
      )
    },
    {
      field: "accountType",
      header: "Account Type",
      sortable: true,
      render: (value) => (
        <p className="text-gray-500 text-theme-sm dark:text-gray-400">
          {value?.toUpperCase()}
        </p>
      )
    },
    {
      field: "isOpen",
      header: "Open/Close",
      sortable: true,
      render: (value) => (
        <span className={`inline-block px-2 py-1 text-xs ${
          value === 1
            ? "bg-success-100 text-success-600"
            : "bg-error-100 text-error-500"
        }`}>
          {value === 1 ? "Open" : "Closed"}
        </span>
      )
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
      )
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
      )
    }
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
        message
      });
      
      // Store selected IDs for use after confirmation
      setSelectedOutlets(selectedIds.filter(id => id !== null));
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${action} outlets`);
      console.error('Error performing bulk action:', err);
    }
  };

  // Add this function to get confirmation details
  const getConfirmationDetails = (action) => {
    switch(action) {
      case 'active':
        return {
          title: 'Confirm Activation',
          message: `Are you sure you want to activate ${selectedOutlets.length} selected outlet(s)?`
        };
      case 'inactive':
        return {
          title: 'Confirm Deactivation',
          message: `Are you sure you want to deactivate ${selectedOutlets.length} selected outlet(s)?`
        };
      case 'delete':
        return {
          title: 'Confirm Deletion',
          message: `Are you sure you want to delete ${selectedOutlets.length} selected outlet(s)? This action cannot be undone.`
        };
      default:
        return { title: '', message: '' };
    }
  };

  // Add this function to execute bulk actions
  const executeBulkAction = async (action) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const validOutletIds = selectedOutlets.filter(id => id !== null && id !== undefined);

      if (validOutletIds.length === 0) {
        throw new Error('No valid outlet IDs selected');
      }

      const response = await axios.post(
        'https://men4u.xyz/v2/common/bulk_outlet_action',
        {
          user_id: adminData.user_id,
          action: action,
          app_source: "admin_dashboard",
          outlet_ids: validOutletIds
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response && response.status === 200) {
        // Reset all selection states
        setSelectedOutlets([]);
        setConfirmModal({ isOpen: false, action: null, title: '', message: '' });
        
        // Refresh the data
        await fetchOutlets();

        // Show success message if needed
        // You can add a toast or notification here
      }
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${action} outlets`);
      console.error('Error performing bulk action:', err);
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
        data={filteredData.filter(outlet => {
          if (statusFilter === 'all') return true;
          const isActive = outlet.outletStatus === 1;
          return statusFilter === 'active' ? isActive : !isActive;
        })}
        columns={columns}
        title="Outlets"
        counts={{
          total: filteredData.length,
          active: filteredData.filter(outlet => outlet.outletStatus === 1).length,
          inactive: filteredData.filter(outlet => outlet.outletStatus === 0).length
        }}
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => navigate('/create-outlet'),
          className: "bg-success-500 hover:bg-success-600",
          position: "right"
        }}
        onBackClick={() => navigate(-1)}
        showBackButton={true}
        searchPlaceholder="Search"
        darkMode={false}
        enableSort={true}
        enablePagination={true}
        enableSearch={true}
        enableSelection={true}
        selectedItems={selectedOutlets}
        onSelectionChange={(selectedIds) => {
          setSelectedOutlets(selectedIds.filter(id => id !== null));
        }}
        onBulkAction={handleBulkAction}
        enableStatusFilter={true}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setCurrentPage(1); // Reset to first page when filter changes
        }}
      />

      {/* Add Modal component for confirmations */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null, title: '', message: '' })}
        title={confirmModal.title}
        type={confirmModal.action === 'delete' ? 'error' : 'warning'}
        size="small"
      >
        <p className="mb-6">{confirmModal.message}</p>
        <div className="flex justify-between items-center w-full gap-3">
          <button
            onClick={() => setConfirmModal({ isOpen: false, action: null, title: '', message: '' })}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={() => executeBulkAction(confirmModal.action)}
            className={`px-4 py-2 text-sm font-medium text-white rounded-full transition ${
              confirmModal.action === 'delete' 
                ? 'bg-error-500 hover:bg-error-600' 
                : 'bg-warning-500 hover:bg-warning-600'
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
          <FontAwesomeIcon
            icon={faTrash}
            className="h-6 w-6 text-error-500"
          />
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
          Are you sure you want to delete outlet "{outletToDelete?.name}"? This action
          cannot be undone. 
          <br/>
          All data associated with this outlet will be permanently removed.
        </p>
      </Modal>
    </>
  );
}

export default Outlets;
