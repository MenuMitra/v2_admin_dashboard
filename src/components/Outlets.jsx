import React, { useState, useEffect } from "react";
import brand02 from "../assets/images/brand/brand-02.svg";
import brand07 from "../assets/images/brand/brand-07.svg";
import brand08 from "../assets/images/brand/brand-08.svg";
import brand10 from "../assets/images/brand/brand-10.svg";
import brand15 from "../assets/images/brand/brand-15.svg";
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
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';

const transactionsData = [
  {
    id: 1,
    name: "Bought PYPL",
    image: brand08,
    date: "Nov 23, 01:00 PM",
    price: "$2,567.88",
    category: "Finance",
    status: "success",
  },
  {
    id: 2,
    name: "Bought AAPL",
    image: brand07,
    date: "Nov 22, 09:00 PM",
    price: "$2,567.88",
    category: "Technology",
    status: "pending",
  },
  {
    id: 3,
    name: "Sell KKST",
    image: brand15,
    date: "Oct 12, 03:54 PM",
    price: "$6,754.99",
    category: "Finance",
    status: "success",
  },
  {
    id: 4,
    name: "Bought FB",
    image: brand02,
    date: "Sep 09, 02:00 AM",
    price: "$1,445.41",
    category: "Social media",
    status: "success",
  },
  {
    id: 5,
    name: "Sell AMZN",
    image: brand10,
    date: "Feb 35, 08:00 PM",
    price: "$5,698.55",
    category: "E-commerce",
    status: "failed",
  },
];

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

  // Transform outlet data to match UI structure
  const transformOutletData = (outlets) => {
    return outlets.map((outlet) => ({
      id: outlet.outlet_id,
      name: outlet.outlet_name,
      code: outlet.outlet_code,
      mobile: outlet.mobile,
      status: getOutletStatus(outlet.outlet_status, outlet.is_open),
      isOpen: outlet.is_open,
      outletStatus: outlet.outlet_status,
      image: brand02,
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
        //   user_id: 2, //HARDCODE
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
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
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
        "https://men4u.xyz/v2/admin/delete_outlet",
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

  return (
    <div className="p-6">
      <Breadcrumb items={breadcrumbItems} />
      
      {/* Header Section - Matching Owners.jsx style */}
      <div className="overflow-hidden rounded-t-2xl pt-4 dark:border-gray-800 dark:bg-white/[0.03] mb-4">
        <div className="flex flex-col gap-4 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
          <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
          </button>
            <div className="flex items-center gap-3">
              <div className="text-gray-800 dark:text-white/90">
                <span className="text-lg font-semibold">
                  Total: {filteredData.length}
                </span>
                <div className="flex gap-3 mt-1 text-sm">
                  <span className="text-success-600">
                    Active: {filteredData.filter(outlet => outlet.outletStatus === 1).length}
                  </span>
                  <span className="text-error-500">
                    Inactive: {filteredData.filter(outlet => outlet.outletStatus === 0).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Outlets
        </div>

          <div className="flex items-center gap-2">
              <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <FontAwesomeIcon icon={faSearch} className="w-5 h-5" />
                </span>
                <input
                  type="text"
                placeholder="Search outlets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-[250px] rounded-lg border border-gray-200 bg-transparent py-2.5 pr-14 pl-12 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
                />
              </div>
            <button 
              onClick={() => navigate('/create-outlet')}
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-success-500 px-4 py-3 font-medium text-white hover:bg-success-600"
            >
              <FontAwesomeIcon icon={faPlus} className="w-5 h-5" />
              Create
            </button>
          </div>
        </div>
      </div>

      {/* Table Section - Matching Owners.jsx style */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="border-t border-gray-100 dark:border-gray-800">
                {tableHeaders.map((header) => (
                  <th
                    key={header.key}
                    className="px-6 py-3 text-center"
                  >
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                        {header.label}
                      </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {getCurrentItems().map((outlet) => (
                <tr key={outlet.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-6 py-3.5 text-center">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {outlet.name}
                    </p>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                      {outlet.code}
                    </p>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                      {outlet.mobile}
                    </p>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                      {outlet.accountType}
                    </p>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-block px-2 py-1 text-xs ${
                      outlet.isOpen === 1
                        ? "bg-success-100 text-success-600"
                        : "bg-error-100 text-error-500"
                    }`}>
                      {outlet.isOpen === 1 ? "Open" : "Closed"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-block px-2 py-1 text-xs ${
                      outlet.outletStatus === 1
                        ? "bg-success-100 text-success-600"
                        : "bg-error-100 text-error-500"
                    }`}>
                      {outlet.outletStatus === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewOutlet(outlet.id)}
                        className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditOutlet(outlet.id)}
                        className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
                        title="Edit Outlet"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(outlet)}
                        className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
                        title="Delete Outlet"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>

      {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalEntries={filteredData.length}
          itemsPerPage={itemsPerPage}
        />

      {/* Delete Modal - Keep existing implementation */}
      {showDeleteModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Modal Content */}
            <div className="relative w-[400px] rounded-lg bg-white shadow-xl mx-4">
              <div className="p-6">
                {/* Header with Warning Icon */}
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-100 mb-4">
                    <svg className="h-6 w-6 text-error-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Confirm Deletion
                    </h3>
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete outlet "{outletToDelete?.name}"? This action cannot be undone. All data associated with this outlet will be permanently removed.
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none min-w-[100px]"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-error-500 rounded-md hover:bg-error-700 focus:outline-none min-w-[100px]"
                    onClick={handleDeleteOutlet}
                  >
                    Delete Outlet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Outlets;
