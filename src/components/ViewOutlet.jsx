import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faEdit,
  faTrash,
  faUpload,
  faInfoCircle,
  faDownload,
  faSpinner,
  faLink,
  faList,
  faUtensils,
  faUserTie,
  faUserCog,
  faUserFriends,
  faUser,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import { faAndroid } from "@fortawesome/free-brands-svg-icons";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { queryKeys } from "../lib/react-query/queryKeys";
import Breadcrumb from "./Breadcrumb";
import DeleteConfirmModal from "./common/DeleteConfirmModal/DeleteConfirmModal";
import Modal from "./common/Modal";
import StatusToggleButton from "./common/StatusToggleButton";
import { API_CONFIG } from "../config/appConfig";
import { toastController } from "../utils/toastController";

function toTitleCase(str) {
  return str
    ? str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
    : "";
}

// Format numbers as currency with comma separators (Indian grouping)
function formatCurrency(amount) {
  if (amount === null || amount === undefined || amount === "") return "-";
  const n = Number(amount);
  if (Number.isNaN(n)) return String(amount);
  return `₹${new Intl.NumberFormat("en-IN").format(n)}`;
}



// Helper to calculate days since last used
function getDaysSinceLastUsed(lastUsed) {
  if (!lastUsed) return null;
  const lastUsedDate = new Date(lastUsed);
  const today = new Date();
  lastUsedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffMs = today - lastUsedDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

function ViewOutlet() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { outletId } = useParams();
  const location = useLocation();
  const urlSearch = new URLSearchParams(location.search);
  const queryAppSource = urlSearch.get("app_source") || null;
  const queryUserId = urlSearch.get("user_id")
    ? Number(urlSearch.get("user_id"))
    : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { BASE_URL, CUSTOMER_APP_URL } = API_CONFIG;

  // Local state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch outlet details query
  const {
    data: outletResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.outlets.detail(outletId),
    queryFn: async () => {
      const requestUserId = queryUserId || adminData?.user_id;
      const requestAppSource = queryAppSource || "admin_app";
      const response = await axios.post(
        `${BASE_URL}/common/view_outlet`,
        {
          outlet_id: outletId,
          user_id: requestUserId,
          app_source: requestAppSource,
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    enabled:
      Boolean(outletId) &&
      (Boolean(adminData?.user_id) || Boolean(queryUserId)),
    staleTime: 30000, // Data considered fresh for 30 seconds
    cacheTime: 300000, // Cache kept for 5 minutes
  });

  // Memoize the outlet data to prevent unnecessary re-renders
  const outletData = React.useMemo(
    () => outletResponse?.data || null,
    [outletResponse]
  );

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return axios.delete(`${BASE_URL}/common/delete_outlet`, {
        headers: {
          Authorization: getToken(),
          "Content-Type": "application/json",
        },
        data: {
          outlet_id: outletId,
          user_id: adminData?.user_id,
          app_source: "admin",
        },
      });
    },
    onSuccess: () => {
      setShowDeleteModal(false);
      queryClient.invalidateQueries(queryKeys.outlets.list());
      navigate("/outlets");
    },
    onError: (error) => {
      toastController.error(
        error.response?.data?.message || "Failed to delete outlet"
      );
    },
  });

  // Generic toggle mutation for all status changes
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ type, value }) => {
      return axios.patch(
        `${BASE_URL}/common/change_outlet_status`,
        {
          outlet_id: outletId,
          user_id: adminData?.user_id,
          app_source: "admin_app",
          type: type,
          value: value,
        },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );
    },
    onMutate: async ({ type, value }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(queryKeys.outlets.detail(outletId));

      // Snapshot the previous value
      const previousOutletData = queryClient.getQueryData(
        queryKeys.outlets.detail(outletId)
      );

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.outlets.detail(outletId), (old) => {
        if (!old?.data) return old;

        const newData = { ...old.data };

        switch (type) {
          case "outlet_status":
            newData.outlet_status = value === "active" ? 1 : 0;
            break;
          case "is_open":
            newData.is_open = value === "open" ? 1 : 0;
            break;
          case "account_type":
            newData.account_type = value;
            break;
        }

        return { ...old, data: newData };
      });

      // Return a context object with the snapshotted value
      return { previousOutletData };
    },
    onSuccess: (_, variables) => {
      const successMessages = {
        outlet_status: "Outlet status updated successfully!",
        is_open: "Open/Close status updated successfully!",
        account_type: "Account type updated successfully!",
      };
      toastController.success(
        successMessages[variables.type] || "Status updated successfully!"
      );
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousOutletData) {
        queryClient.setQueryData(
          queryKeys.outlets.detail(outletId),
          context.previousOutletData
        );
      }
      toastController.error(
        error.response?.data?.message || "Failed to update status"
      );
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries(queryKeys.outlets.detail(outletId));
    },
  });

  // Bulk upload mutation
  const bulkUploadMutation = useMutation({
    mutationFn: async (formData) => {
      return axios.post(
        `${BASE_URL}/common/bulk_upload_file`,
        formData,
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: () => {
      setShowBulkUploadModal(false);
      setSelectedFile(null);
      queryClient.invalidateQueries(queryKeys.outlets.detail(outletId));
      toastController.success("Menu data uploaded successfully!");
    },
    onError: (error) => {
      toastController.error(
        error.response?.data?.message || "Failed to upload menu data"
      );
    },
  });

  // Handlers
  const handleDelete = () => setShowDeleteModal(true);
  const confirmDelete = () => deleteMutation.mutate();
  const handleEdit = () => navigate(`/edit-outlet/${outletId}`);
  const handleOwnerClick = (ownerId) => navigate(`/owner-details/${ownerId}`);

  // Toggle handlers
  const handleToggleOutletStatus = () => {

    const newValue = outletData?.outlet_status === 1 ? "inactive" : "active";

    toggleStatusMutation.mutate({ type: "outlet_status", value: newValue });
  };

  const handleToggleOpenStatus = () => {

    const newValue = outletData?.is_open === 1 ? "close" : "open";

    toggleStatusMutation.mutate({ type: "is_open", value: newValue });
  };

  const handleToggleAccountType = () => {

    const newValue = outletData?.account_type === "test" ? "live" : "test";

    toggleStatusMutation.mutate({ type: "account_type", value: newValue });
  };

  const handleBulkUpload = () => {
    if (!selectedFile) {
      toastController.error("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("outlet_id", outletId);
    formData.append("user_id", adminData?.user_id);
    formData.append("app_source", "admin_app");
    formData.append("file", selectedFile);

    bulkUploadMutation.mutate(formData);
  };

  // Rest of the handlers remain the same
  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const templateUrl = "/downloads/bulk_template.csv";
      const response = await fetch(templateUrl);

      if (!response.ok) {
        throw new Error("Template file not found");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bulk_template.csv";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toastController.success("Template downloaded successfully!");
    } catch (error) {

      toastController.error("Failed to download template");
    } finally {
      setIsDownloading(false);
    }
  };

  // Memoize breadcrumb items
  const breadcrumbItems = React.useMemo(
    () => [
      { label: "Home", path: "/Home" },
      { label: "Outlets", path: "/outlets" },
      { label: outletData?.name || "View Outlet" },
    ],
    [outletData?.name]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-error-500 text-center p-4">
        {error.response?.data?.message || "Failed to load outlet details"}
      </div>
    );
  }

  // Rest of your JSX remains the same, just use the loading states from mutations where needed
  return (
    <>
      {/* Breadcrumb - Moved outside the card */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          {/* Top Row - Back, Title, Actions */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 inline-flex items-center capitalize">
                {toTitleCase(outletData?.name) || "-"}
              </h2>
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium transition rounded-full border border-gray-200 bg-white hover:bg-gray-50 shadow-theme-xs disabled:opacity-60"
                title="Reload"
              >
                <FontAwesomeIcon
                  icon={faRotate}
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>
              <a
                href={`${CUSTOMER_APP_URL}/o${outletData?.outlet_code}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium transition rounded-full border border-brand-500 text-brand-500 bg-white hover:bg-brand-50 shadow-theme-xs"
                title="Open Customer App"
              >
                <FontAwesomeIcon icon={faAndroid} className="w-4 h-4" />
                <span className="hidden sm:inline">Customer App</span>
              </a>

              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-warning-500 hover:bg-warning-600 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-error-500 hover:bg-error-600 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 pb-4">
          {/* Using flex-col by default for mobile and row for larger screens */}
          <div className="flex flex-col md:flex-row justify-between items-stretch gap-2 md:gap-6 mt-0">
            {/* Outlet Image Section */}
            {outletData?.image && (
              <div className="p-4 sm:p-6 bg-white w-full md:flex-1 border border-gray-200 rounded-2xl">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                  Outlet Image
                </h2>
                <div className="flex justify-center">
                  <div className="relative">
                    <img
                      src={outletData.image}
                      alt={`${outletData?.name || "Outlet"} image`}
                      className="w-[252px] h-[252px] sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40 rounded-lg shadow-lg object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Menu Management Section */}
            <div className="p-4 sm:p-6 bg-white w-full md:flex-1 border border-gray-200 rounded-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  Menu Management
                </h2>
                <button
                  onClick={() => setShowBulkUploadModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font- transition rounded-full border-brand-500 border-2 text-dark shadow-theme-xs"
                >
                  <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
                  <span>Bulk Upload</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Link
                  to={`/categories/${outletId}`}
                  className="flex items-center justify-center p-3 sm:p-4 rounded-3xl border border-gray-200 bg-white hover:border-brand-500 hover:shadow-lg transition-all duration-200"
                >
                  <FontAwesomeIcon
                    icon={faList}
                    className="w-5 h-5 mr-2 text-gray-800"
                  />
                  <span className="text-md font-medium text-gray-800">
                    Categories
                  </span>
                </Link>

                <Link
                  to={`/menus/${outletId}`}
                  className="flex items-center justify-center p-3 sm:p-4 rounded-3xl border border-gray-200 bg-white hover:border-brand-500 hover:shadow-lg transition-all duration-200"
                >
                  <FontAwesomeIcon
                    icon={faUtensils}
                    className="w-5 h-5 mr-2 text-gray-800"
                  />
                  <span className="text-md font-medium text-gray-800">
                    Menus
                  </span>
                </Link>
              </div>
            </div>

            {/* Staff Management Section */}
            {/* <div className="p-4 sm:p-6 bg-white w-full md:flex-1 border border-gray-200 rounded-2xl">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Staff Management
              </h2>
              <div className="grid grid-cols-1">
                <Link
                  to={`/staff/${outletId}`}
                  className="flex items-center justify-center p-4 rounded-xl border border-gray-200 bg-white hover:border-brand-500 hover:shadow-lg transition-all duration-200"
                >
                  <FontAwesomeIcon
                    icon={faUserFriends}
                    className="w-5 h-5 mr-2 text-gray-800"
                  />
                  <span className="text-md font-medium text-gray-800">
                    Staff
                  </span>
                </Link>
              </div>
            </div> */}
          </div>
          {/* Outlet Owners Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Outlet Owners
              </h2>
            </div>
            <div className="flex items-center justify-between pb-5">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {outletData?.owners?.map((owner) => (
                      <div
                        key={owner.owner_id}
                        onClick={() => handleOwnerClick(owner.owner_id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer
                          ${owner.is_primary
                            ? "bg-brand-100 text-brand-700 border border-brand-200 hover:bg-brand-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                          }
                          transition-all duration-200
                        `}
                      >
                        <span>{toTitleCase(owner.owner_name)}</span>
                        {owner.is_primary && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-brand-500 text-white rounded-full">
                            P
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Basic Information
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {/* Outlet Name */}
            {outletData?.name && (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                        {toTitleCase(outletData.name)}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Outlet Name
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Mobile Number */}
            {outletData?.mobile && (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                        {outletData.mobile}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Mobile Number
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Address */}
            {outletData?.address && (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                        {outletData.address}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Address
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* WhatsApp */}
            {outletData?.whatsapp && (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                        {outletData.whatsapp}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        WhatsApp
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Outlet Type */}
            {outletData?.outlet_type && (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                        {outletData.outlet_type
                          ? outletData.outlet_type.charAt(0).toUpperCase() +
                          outletData.outlet_type.slice(1).replace(/_/g, " ")
                          : "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Outlet Type
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Outlet Status */}
            <div className="flex justify-start">
              <div>
                <StatusToggleButton
                  isActive={outletData?.outlet_status === 1}
                  onToggle={handleToggleOutletStatus}
                  disabled={toggleStatusMutation.isPending}
                  activeLabel="Active"
                  inactiveLabel="Inactive"
                />
                <div className="text-sm text-gray-500 mt-1">Outlet Status</div>
              </div>
            </div>
            {/* Open/Close Status */}
            <div className="flex justify-start">
              <div>
                <StatusToggleButton
                  isActive={outletData?.is_open === 1}
                  onToggle={handleToggleOpenStatus}
                  disabled={toggleStatusMutation.isPending}
                  activeLabel="Open"
                  inactiveLabel="Closed"
                />
                <div className="text-sm text-gray-500 mt-1">Open/Close Status</div>
              </div>
            </div>
          </div>
          {/* Business Details section with divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Business Details
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {/* Food Type */}
              {outletData?.veg_nonveg && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                          {outletData.veg_nonveg.charAt(0).toUpperCase() +
                            outletData.veg_nonveg.slice(1)}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Food Type
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Service Charges */}
              {outletData?.service_charges != null && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                          {`${outletData.service_charges}%`}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Service Charges
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* GST */}
              {outletData?.gst != null && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                          {`${outletData.gst}%`}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          GST
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Opening Hours */}
              {outletData?.opening_time && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                          {outletData.opening_time}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Opening Hours
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Closing Hours */}
              {outletData?.closing_time && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                          {outletData.closing_time}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Closing Hours
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* FSSAI Number */}
              {outletData?.fssainumber && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                          {outletData.fssainumber}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          FSSAI Number
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* GST Number */}
              {outletData?.gstnumber && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                          {outletData.gstnumber}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          GST Number
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* UPI ID */}
              {outletData?.upi_id && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                          {outletData.upi_id}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          UPI ID
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Has Combo */}
              {outletData?.has_combo !== undefined &&
                outletData?.has_combo !== null && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                            {outletData.has_combo === 1 ? "Yes" : "No"}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Has Combo
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              {/* Has Denomination */}
              {outletData?.has_denomination !== undefined &&
                outletData?.has_denomination !== null && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                            {outletData.has_denomination === 1 ? "Yes" : "No"}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Has Denomination
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              {/* Has Udhari */}
              {outletData?.has_udhari !== undefined &&
                outletData?.has_udhari !== null && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                            {outletData.has_udhari === 1 ? "Yes" : "No"}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Has Udhari
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              {/* Reserve Table */}
              {outletData?.has_reserve_table !== undefined &&
                outletData?.has_reserve_table !== null && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                            {outletData.has_reserve_table === 1 ? "Yes" : "No"}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Reserve Table
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
          {/* Order section with divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Orders Details
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                        {outletData?.total_order ?? "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Order Count
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                        {outletData?.total_earning != null
                          ? formatCurrency(outletData.total_earning)
                          : "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Earning
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Manage Staff Details section with divider */}
          {/* <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Manage Staff Details
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                        {outletData?.staff_count ??
                          outletResponse?.data?.staff_count ??
                          outletResponse?.staff_count ??
                          "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Staff Count
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
          {/* Manage Outlet Details section with divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Manage Outlet Details
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                        {outletData?.total_menu ?? "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Menus
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                        {outletData?.total_category ?? "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Categories
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                        {outletData?.section_count ?? "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sections
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                        {outletData?.table_count ?? "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Tables
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Subscription Details section with divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Subscription Details
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {/* Plan Name */}
              {outletData?.subscription_details?.subscription_name && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                          {outletData.subscription_details.subscription_name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Plan
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Subscription Price */}
              {outletData?.subscription_details?.subscription_price != null && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                          {formatCurrency(
                            outletData.subscription_details.subscription_price
                          )}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Price
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Tenure */}
              {outletData?.subscription_details?.tenure && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                          {outletData.subscription_details.tenure}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Tenure
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Start Date */}
              {outletData?.subscription_details?.subscription_start_date && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                          {
                            outletData.subscription_details
                              .subscription_start_date
                          }
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Start Date
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* End Date */}
              {outletData?.subscription_details?.subscription_end_date && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                          {
                            outletData.subscription_details
                              .subscription_end_date
                          }
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          End Date
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Days Until Expiry */}
              {outletData?.subscription_details?.subscription_start_date &&
                outletData?.subscription_details?.subscription_end_date && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-full">
                        <h4 className="text-base font-medium text-gray-800 dark:text-white/90 mb-2">
                          TimeLine
                        </h4>
                        {(() => {
                          const msPerDay = 1000 * 60 * 60 * 24;
                          const start = new Date(
                            outletData.subscription_details.subscription_start_date
                          );
                          const end = new Date(
                            outletData.subscription_details.subscription_end_date
                          );
                          const now = new Date();
                          const total = Math.max(
                            0,
                            Math.ceil((end - start) / msPerDay)
                          );
                          const remaining = Math.max(
                            0,
                            Math.ceil((end - now) / msPerDay)
                          );
                          const elapsed = Math.max(0, total - remaining);
                          const percent =
                            total > 0
                              ? Math.min(
                                100,
                                Math.max(0, (elapsed / total) * 100)
                              )
                              : 0;
                          // Choose progress bar color based on remaining days:
                          // - <=5 days: red (urgent)
                          // - <=15 days: orange (warning)
                          // - >15 days: green (healthy)
                          let barColorClass = "bg-success-500"; // green by default
                          if (remaining <= 5) {
                            barColorClass = "bg-error-500"; // red
                          } else if (remaining <= 15) {
                            barColorClass = "bg-warning-500"; // orange
                          }

                          return (
                            <div>
                              <div
                                className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={Math.round(percent)}
                              >
                                <div
                                  className={`h-2 ${barColorClass} rounded-full transition-all duration-500`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between mt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {elapsed} days completed
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {remaining} days remaining
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

              {/* Modules (display only module names) */}
              {outletData?.modules && outletData.modules.length > 0 && (
                <div className="col-span-1 sm:col-span-2 md:col-span-3 xl:col-span-4">
                  <div>
                    <h4 className="text-lg font-normal text-gray-800 dark:text-white/90 mb-2">
                      Modules
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {outletData.modules.map((mod) => (
                        <span
                          key={mod.module_id}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 border border-gray-200"
                        >
                          {mod.name ? mod.name.replace(/_/g, " ") : "-"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Audit Information section with divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Audit Information
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {/* Created On */}
              {outletData?.created_on && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                          {outletData.created_on}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created On
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Created By */}
              {outletData?.created_by_name && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                          {toTitleCase(outletData.created_by_name)}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created By
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Updated On */}
              {outletData?.updated_on && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                          {outletData.updated_on}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Updated On
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Updated By */}
              {outletData?.updated_by_name && (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                          {toTitleCase(outletData.updated_by_name)}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Updated By
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={confirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this outlet?"
        isLoading={deleteMutation.isPending}
      />

      {/* Bulk Upload Modal */}
      <Modal
        isOpen={showBulkUploadModal}
        onClose={() => {
          setShowBulkUploadModal(false);
          setSelectedFile(null);
        }}
        title="Bulk Upload"
        type="default"
        size="small"
        actionButtons={
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => {
                setShowBulkUploadModal(false);
                setSelectedFile(null);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 text-black px-6 py-3 text-sm font-semibold transition hover:bg-gray-600"
              disabled={bulkUploadMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleBulkUpload}
              disabled={!selectedFile || bulkUploadMutation.isPending}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition ${selectedFile && !bulkUploadMutation.isPending
                ? "bg-success-500 hover:bg-success-600"
                : "bg-success-500 opacity-50 cursor-not-allowed"
                }`}
            >
              <FontAwesomeIcon
                icon={bulkUploadMutation.isPending ? faSpinner : faUpload}
                className={`w-4 h-4 ${bulkUploadMutation.isPending ? "animate-spin" : ""
                  }`}
              />
              {bulkUploadMutation.isPending ? "Uploading..." : "Upload"}
            </button>
          </div>
        }
      >
        <div className="pl-0">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400 text-left">
              Upload file
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="focus:border-ring-brand-300 shadow-theme-xs focus:file:ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pr-3 file:pl-3.5 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400"
            />
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2 rounded-lg border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800 dark:border-warning-700 dark:bg-warning-900/50 dark:text-warning-500">
              <FontAwesomeIcon icon={faInfoCircle} className="h-5 w-5" />
              <p>
                Please ensure your CSV file follows the template format. Any
                deviation may result in upload failure.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
              className={`inline-flex items-center gap-2 text-sm font-medium ${isDownloading
                ? "text-gray-400 cursor-not-allowed"
                : "text-brand-500 hover:text-brand-600"
                }`}
            >
              <FontAwesomeIcon
                icon={isDownloading ? faSpinner : faDownload}
                className={`h-4 w-4 ${isDownloading ? "animate-spin" : ""}`}
              />
              {isDownloading ? "Downloading..." : "Download Template"}
            </button>
            <span className="text-sm text-gray-500">
              {selectedFile
                ? `Selected: ${selectedFile.name}`
                : "No file selected"}
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ViewOutlet;
