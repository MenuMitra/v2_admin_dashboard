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
} from "@fortawesome/free-solid-svg-icons";

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
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

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

      const response = await axios.get(
        `https://men4u.xyz/v2/admin/listview_owner/${adminData.user_id}`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
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

      await axios.delete("https://men4u.xyz/v2/admin/delete_owner", {
        data: {
          owner_id: ownerToDelete,
          user_id: adminData.user_id,
        },
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
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
                  Total: {getTotalCount()}
                </span>
                <div className="flex gap-3 mt-1 text-sm">
                  <span className="text-success-600">
                    Active: {getActiveCount()}
                  </span>
                  <span className="text-error-500">
                    Inactive: {getInactiveCount()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Outlet Owners
          </div>

          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={() => navigate("/create-owner")}
              className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-success-500 px-4 py-3 font-medium text-white hover:bg-success-600"
            >
              <FontAwesomeIcon icon={faPlus} className="w-5 h-5" />
              Create
            </button>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search owners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pr-14 pl-12 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden xl:w-[430px] dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="border-t border-gray-100 dark:border-gray-800">
                <th
                  className="px-6 py-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center justify-center">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Name
                    </p>
                    {renderSortIcon("name")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center justify-center">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Email
                    </p>
                    {renderSortIcon("email")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort("mobile")}
                >
                  <div className="flex items-center justify-center">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Mobile
                    </p>
                    {renderSortIcon("mobile")}
                  </div>
                </th>
                <th className="px-6 py-3 text-center">
                  <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                    Address
                  </p>
                </th>
                <th
                  className="px-6 py-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort("is_active")}
                >
                  <div className="flex items-center justify-center">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Status
                    </p>
                    {renderSortIcon("is_active")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort("account_type")}
                >
                  <div className="flex items-center justify-center">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Account Type
                    </p>
                    {renderSortIcon("account_type")}
                  </div>
                </th>
                <th className="px-6 py-3 text-center">
                  <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                    Actions
                  </p>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((owner) => (
                <tr
                  key={owner.user_id}
                  className="border-t border-gray-100 dark:border-gray-800"
                >
                  <td className="px-6 py-3.5 text-center">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {owner.name}
                    </p>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                      {owner.email}
                    </p>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                      {owner.mobile}
                    </p>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                      {owner.address}
                    </p>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span
                      className={`inline-block px-2 py-1 text-xs ${
                        owner.is_active === 1
                          ? "bg-success-100 text-success-600"
                          : "bg-error-100 text-error-500"
                      }`}
                    >
                      {owner.is_active === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span
                      className={`inline-block px-2 py-1 text-xs ${
                        owner.account_type === "live"
                          ? "text-error-600"
                          : "text-success-600"
                      }`}
                    >
                      {owner.account_type?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* View Button - Blue */}
                      <button
                        onClick={() => handleViewOwner(owner.user_id)}
                        className="w-8 h-8 flex items-center justify-center text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs transition"
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                      </button>

                      {/* Edit Button - Yellow/Warning */}
                      <button
                        onClick={() => handleEditOwner(owner.user_id)}
                        className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
                        title="Edit Owner"
                      >
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          className="w-4 h-4"
                        />
                      </button>

                      {/* Delete Button - Red */}
                      <button
                        onClick={() => openDeleteModal(owner.user_id)}
                        className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
                        title="Delete Owner"
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => {
              setShowDeleteModal(false);
              setOwnerToDelete(null);
            }}
          />

          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg dark:bg-gray-800">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <FontAwesomeIcon
                      icon={faExclamationTriangle}
                      className="h-6 w-6 text-error-500"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Confirm Deletion
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this owner? This action
                        cannot be undone. All data associated with this owner
                        will be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-4">
        <div className="text-gray-500 text-theme-sm dark:text-gray-400">
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, getSortedOwners().length)} of{" "}
          {getSortedOwners().length} entries
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-normal">
          <button
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
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
            onClick={() =>
              currentPage < totalPages && handlePageChange(currentPage + 1)
            }
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Owners;
