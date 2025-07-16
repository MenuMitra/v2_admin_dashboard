import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
} from "@fortawesome/free-solid-svg-icons";
import { useParams, useNavigate, Link } from "react-router-dom";
import { queryKeys } from '../lib/react-query/queryKeys';
import Breadcrumb from "./Breadcrumb";
import DeleteConfirmModal from "./common/DeleteConfirmModal/DeleteConfirmModal";
import Modal from "./common/Modal";
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

function ViewOutlet() {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { outletId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { BASE_URL, API_VERSION } = API_CONFIG;

  // Local state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch outlet details query
  const {
    data: outletResponse,
    isLoading,
    error
  } = useQuery({
    queryKey: queryKeys.outlets.detail(outletId),
    queryFn: async () => {
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/common/view_outlet`,
        {
          outlet_id: outletId,
          user_id: adminData?.user_id,
          app_source: "admin_app",
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
    enabled: Boolean(adminData?.user_id) && Boolean(outletId),
    staleTime: 30000, // Data considered fresh for 30 seconds
    cacheTime: 300000, // Cache kept for 5 minutes
  });

  // Memoize the outlet data to prevent unnecessary re-renders
  const outletData = React.useMemo(() => 
    outletResponse?.data || null,
    [outletResponse]
  );

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return axios.delete(`${BASE_URL}/${API_VERSION}/common/delete_outlet`, {
        headers: {
          Authorization: getToken(),
          "Content-Type": "application/json",
        },
        data: {
          outlet_id: outletId,
          user_id: adminData?.user_id,
        },
      });
    },
    onSuccess: () => {
      setShowDeleteModal(false);
      queryClient.invalidateQueries(queryKeys.outlets.all);
      navigate("/outlets");
    },
    onError: (error) => {
      toastController.error(error.response?.data?.message || "Failed to delete outlet");
    }
  });

  // Bulk upload mutation
  const bulkUploadMutation = useMutation({
    mutationFn: async (formData) => {
      return axios.post(
        `${BASE_URL}/${API_VERSION}/common/bulk_upload_file`,
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
      toastController.error(error.response?.data?.message || "Failed to upload menu data");
    }
  });

  // Handlers
  const handleDelete = () => setShowDeleteModal(true);
  const confirmDelete = () => deleteMutation.mutate();
  const handleEdit = () => navigate(`/edit-outlet/${outletId}`);
  const handleOwnerClick = (ownerId) => navigate(`/owner-details/${ownerId}`);

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
      console.error("Error downloading template:", error);
      toastController.error("Failed to download template");
    } finally {
      setIsDownloading(false);
    }
  };

  // Memoize breadcrumb items
  const breadcrumbItems = React.useMemo(() => [
    { label: "Home", path: "/Home" },
    { label: "Outlets", path: "/outlets" },
    { label: outletData?.name || "View Outlet" },
  ], [outletData?.name]);

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
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 inline-flex items-center">
                {outletData?.name || "-"}
                <a
                  href={`https://testing-menumitra-customer-v2.netlify.app/o${outletData?.outlet_code}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View in Customer App"
                  className="inline-flex items-center justify-center ml-2 w-6 h-6 text-gray-700 transition rounded-full  hover:bg-gray-300"
                >
                  <FontAwesomeIcon icon={faLink} className="w-4 h-4" />
                </a>
              </h2>
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-2">
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
        <div className="p-4 sm:p-6">
          {/* Using flex-col by default for mobile and row for larger screens */}
          <div className="flex flex-col md:flex-row justify-between items-stretch gap-4 md:gap-6">
            {/* Menu Management Section */}
            <div className="p-4 sm:p-6 bg-white w-full md:flex-1 border border-gray-200 rounded-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  Menu Management
                </h2>
                <button
                  onClick={() => setShowBulkUploadModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 hover:bg-brand-600 shadow-theme-xs"
                >
                  <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
                  <span>Bulk Upload</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Link
                  to={`/categories/${outletId}`}
                  className="flex items-center justify-center p-3 sm:p-4 rounded-xl border border-gray-200 bg-white hover:border-brand-500 hover:shadow-lg transition-all duration-200"
                >
                  <span className="text-sm font-medium text-gray-800">
                    Categories
                  </span>
                </Link>

                <Link
                  to={`/menus/${outletId}`}
                  className="flex items-center justify-center p-3 sm:p-4 rounded-xl border border-gray-200 bg-white hover:border-brand-500 hover:shadow-lg transition-all duration-200"
                >
                  <span className="text-sm font-medium text-gray-800">
                    Menus
                  </span>
                </Link>
              </div>
            </div>

            {/* Staff Management Section */}
            <div className="p-4 sm:p-6 bg-white w-full md:flex-1 border border-gray-200 rounded-2xl">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Staff Management
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Link
                  to={`/managers/${outletId}`}
                  className="flex items-center justify-center p-3 sm:p-4 rounded-xl border border-gray-200 bg-white hover:border-brand-500 hover:shadow-lg transition-all duration-200"
                >
                  <span className="text-sm font-medium text-gray-800">
                    Managers
                  </span>
                </Link>

                <Link
                  to={`/chefs/${outletId}`}
                  className="flex items-center justify-center p-3 sm:p-4 rounded-xl border border-gray-200 bg-white hover:border-brand-500 hover:shadow-lg transition-all duration-200"
                >
                  <span className="text-sm font-medium text-gray-800">
                    Chefs
                  </span>
                </Link>

                <Link
                  to={`/captains/${outletId}`}
                  className="flex items-center justify-center p-3 sm:p-4 rounded-xl border border-gray-200 bg-white hover:border-brand-500 hover:shadow-lg transition-all duration-200"
                >
                  <span className="text-sm font-medium text-gray-800">
                    Captains
                  </span>
                </Link>

                <Link
                  to={`/waiters/${outletId}`}
                  className="flex items-center justify-center p-3 sm:p-4 rounded-xl border border-gray-200 bg-white hover:border-brand-500 hover:shadow-lg transition-all duration-200"
                >
                  <span className="text-sm font-medium text-gray-800">
                    Waiters
                  </span>
                </Link>
              </div>
            </div>
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
                          ${
                            owner.is_primary
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
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                      {toTitleCase(outletData?.name)}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Outlet Name
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
                      {outletData?.mobile}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Mobile Number
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
                      {outletData?.address}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Address
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
                      {outletData?.whatsapp || "-"}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      WhatsApp
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
                      {outletData?.outlet_mode
                        ? outletData.outlet_mode.charAt(0).toUpperCase() +
                          outletData.outlet_mode.slice(1)
                        : "-"}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Outlet Mode
                    </p>
                  </div>
                </div>
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
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                        {outletData?.veg_nonveg
                          ? outletData.veg_nonveg.charAt(0).toUpperCase() +
                            outletData.veg_nonveg.slice(1)
                          : "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Food Type
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
                        {outletData?.service_charges != null
                          ? `${outletData.service_charges}%`
                          : "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Service Charges
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
                        {outletData?.gst != null ? `${outletData.gst}%` : "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        GST
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
                        {outletData?.opening_time || "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Opening Hours
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
                        {outletData?.closing_time || "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Closing Hours
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
                        {outletData?.fssainumber || "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        FSSAI Number
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
                        {outletData?.gstnumber || "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        GST Number
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
                        {outletData?.upi_id || "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        UPI ID
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
                        {outletData?.orders_count ?? "-"}
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
                          ? `₹${outletData.total_earning}`
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
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Manage Staff Details
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                        {outletData?.waiter_count ?? "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Waiters
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
                        {outletData?.chef_count ?? "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Chefs
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
                        {outletData?.captain_count ?? "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Captains
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
                        {outletData?.manager_count ?? "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Managers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                        {outletData?.orders_count ?? "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Orders
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

          {/* Audit Information section with divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Audit Information
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                        {outletData?.created_on || "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Created On
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
                        {outletData?.created_by || "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Created By
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
                        {outletData?.updated_on || "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Updated On
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
                        {outletData?.updated_by
                          ? outletData.updated_by.charAt(0).toUpperCase() +
                            outletData.updated_by.slice(1)
                          : "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Updated By
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
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-normal text-gray-800 dark:text-white/90">
                        {outletData?.subscription_details?.name || "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Plan Name
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
                        {outletData?.subscription_details?.price
                          ? `₹${outletData.subscription_details.price}`
                          : "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Plan Price
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
                        {outletData?.subscription_details
                          ?.subscription_start_date || "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Start Date
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
                        {outletData?.subscription_details
                          ?.subscription_end_date || "-"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        End Date
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition ${
                selectedFile && !bulkUploadMutation.isPending
                  ? "bg-success-500 hover:bg-success-600"
                  : "bg-success-500 opacity-50 cursor-not-allowed"
              }`}
            >
              <FontAwesomeIcon
                icon={bulkUploadMutation.isPending ? faSpinner : faUpload}
                className={`w-4 h-4 ${bulkUploadMutation.isPending ? "animate-spin" : ""}`}
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
              className={`inline-flex items-center gap-2 text-sm font-medium ${
                isDownloading
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
