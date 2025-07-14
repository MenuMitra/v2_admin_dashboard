import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faUserGear,
  faChevronLeft,
  faEdit,
  faTrash,
  faListUl,
  faUserPen,
  faUsers,
  faUpload,
  faInfoCircle,
  faDownload,
  faSpinner,
  faLink,
  faBowlFood,
} from "@fortawesome/free-solid-svg-icons";
import { useParams, useNavigate, Link } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
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
  const [outletData, setOutletData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const { BASE_URL, API_VERSION } = API_CONFIG;

  const fetchOutletDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await toastController.promise(
        axios.post(
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
        ),
        {
          loading: "Loading outlet details...",
          success: "Outlet details loaded successfully!",
          error: "Failed to load outlet details",
        }
      );

      if (response.data.detail === "Successfully retrieved outlet details") {
        setOutletData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch outlet details");
      console.error("Error fetching outlet details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminData?.user_id && outletId) {
      fetchOutletDetails();
    }
  }, [adminData?.user_id, outletId]);

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Outlets", path: "/outlets" },
    { label: outletData?.name || "View Outlet" },
  ];

  // Add these handler functions
  const handleEdit = () => {
    navigate(`/edit-outlet/${outletId}`);
  };

  const handleDelete = async () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await toastController.promise(
        axios.delete(`${BASE_URL}/${API_VERSION}/common/delete_outlet`, {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
          data: {
            outlet_id: outletId,
            user_id: adminData?.user_id,
          },
        }),
        {
          loading: "Deleting outlet...",
          success: "Outlet deleted successfully!",
          error: "Failed to delete outlet",
        }
      );

      setShowDeleteModal(false);
      navigate("/outlets");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete outlet");
      console.error("Error deleting outlet:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerClick = (ownerId) => {
    navigate(`/owner-details/${ownerId}`);
  };

  const handleBulkUpload = async () => {
    try {
      if (!selectedFile) {
        toastController.error("Please select a file to upload");
        return;
      }

      setLoading(true);
      const formData = new FormData();
      formData.append("outlet_id", outletId);
      formData.append("user_id", adminData?.user_id);
      formData.append("app_source", "admin_app");
      formData.append("file", selectedFile);

      await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/common/bulk_upload_file`,
          formData,
          {
            headers: {
              Authorization: getToken(),
              "Content-Type": "multipart/form-data",
            },
          }
        ),
        {
          loading: "Uploading menu data...",
          success: "Menu data uploaded successfully!",
          error: "Failed to upload menu data",
        }
      );

      setShowBulkUploadModal(false);
      setSelectedFile(null);
      fetchOutletDetails();
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setLoading(false);
    }
  };

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
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 hover:bg-brand-600 shadow-theme-xs"
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
        <div className="p-6">
          {/* Outlet Image - Only shown if image URL exists */}
          {outletData?.image && (
            <div className="mb-6">
              <div className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={outletData.image}
                  alt={`${outletData.name || "Outlet"}`}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.target.style.display = "none"; // Hide image on error
                  }}
                />
              </div>
            </div>
          )}

          {/* Menu Management Section */}
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Menu Management
            </h2>
            <button
              onClick={() => setShowBulkUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 hover:bg-brand-600 shadow-theme-xs"
            >
              <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
              <span className="hidden sm:inline">Bulk Upload</span>
            </button>
          </div>

          <div className="border-t border-gray-100 p-4 dark:border-gray-800 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
              {/* Media item*/}
              <div className="flex items-center rounded-2xl border border-gray-100 bg-white py-4 pl-4 pr-4 dark:border-gray-800 dark:bg-white/[0.03] xl:pr-5">
                <div className="flex items-center gap-4 pr-4">
                  <Link
                    to={`/categories/${outletId}`}
                    className="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all duration-200 hover:border-brand-500 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="gap-4">
                        <div className="flex flex-col">
                          <span className="text-lg font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500">
                            Categories
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
                <Link
                  to={`/menus/${outletId}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all duration-200 hover:border-brand-500 hover:shadow-lg"
                >
                  <div className="flex items-center ">
                    <div className="gap-4">
                      <div className="flex flex-col">
                        <span className="text-lg font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500">
                          Menus
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              {/* Media item*/}
              <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white py-4 pl-4 pr-4 dark:border-gray-800 dark:bg-white/[0.03] xl:pr-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-theme-pink-500/[0.08] text-theme-pink-500">
                    <svg
                      className="stroke-current"
                      width={25}
                      height={24}
                      viewBox="0 0 25 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.70825 5.93126L6.70825 18.0687C6.70825 19.2416 7.9937 19.9607 8.99315 19.347L18.8765 13.2783C19.83 12.6928 19.83 11.3072 18.8765 10.7217L8.99315 4.65301C7.9937 4.03931 6.70825 4.75844 6.70825 5.93126Z"
                        stroke=""
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-gray-800 dark:text-white/90">
                      Videos
                    </h4>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      22% Used
                    </span>
                  </div>
                </div>
                <div>
                  <span className="mb-1 block text-right text-sm text-gray-500 dark:text-gray-400">
                    245 files
                  </span>
                  <span className="block text-right text-sm text-gray-500 dark:text-gray-400">
                    26.40 GB
                  </span>
                </div>
              </div>
              {/* Media item*/}
              <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white py-4 pl-4 pr-4 dark:border-gray-800 dark:bg-white/[0.03] xl:pr-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-blue-500/[0.08] text-blue-light-500">
                    <svg
                      className="fill-current"
                      width={25}
                      height={24}
                      viewBox="0 0 25 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M21.4166 4.00001C21.4166 3.77689 21.3173 3.56536 21.1456 3.42287C20.9739 3.28039 20.7477 3.22173 20.5284 3.26285L8.52841 5.51285C8.17368 5.57936 7.91663 5.88909 7.91663 6.25001V9.98484C7.91644 9.99437 7.91644 10.0039 7.91663 10.0135V14.4585C7.3716 14.1636 6.72327 14 6.04163 14C5.16738 14 4.34794 14.2691 3.73094 14.7392C3.11333 15.2098 2.66663 15.9138 2.66663 16.75C2.66663 17.5862 3.11333 18.2902 3.73094 18.7608C4.34794 19.2309 5.16738 19.5 6.04163 19.5C6.91587 19.5 7.73532 19.2309 8.35231 18.7608C8.95774 18.2995 9.39893 17.6139 9.41611 16.7993C9.41645 16.79 9.41663 16.7806 9.41663 16.7712V16.75V10.62L19.9166 8.60938V12.2085C19.3716 11.9136 18.7233 11.75 18.0416 11.75C17.1674 11.75 16.3479 12.0191 15.7309 12.4892C15.1133 12.9598 14.6666 13.6638 14.6666 14.5C14.6666 15.3362 15.1133 16.0402 15.7309 16.5108C16.3479 16.9809 17.1674 17.25 18.0416 17.25C18.9159 17.25 19.7353 16.9809 20.3523 16.5108C20.9577 16.0495 21.3989 15.3639 21.4161 14.5493C21.4165 14.54 21.4166 14.5306 21.4166 14.5212V14.5V4.00001ZM19.9166 14.5C19.9166 14.2316 19.7757 13.9357 19.4432 13.6824C19.1102 13.4286 18.6171 13.25 18.0416 13.25C17.4661 13.25 16.9731 13.4286 16.64 13.6824C16.3076 13.9357 16.1666 14.2316 16.1666 14.5C16.1666 14.7684 16.3076 15.0643 16.64 15.3176C16.9731 15.5714 17.4661 15.75 18.0416 15.75C18.6171 15.75 19.1102 15.5714 19.4432 15.3176C19.7757 15.0643 19.9166 14.7684 19.9166 14.5ZM7.44325 15.9324C7.7757 16.1857 7.91663 16.4816 7.91663 16.75C7.91663 17.0184 7.7757 17.3143 7.44325 17.5676C7.11018 17.8214 6.61713 18 6.04163 18C5.46613 18 4.97307 17.8214 4.64 17.5676C4.30755 17.3143 4.16663 17.0184 4.16663 16.75C4.16663 16.4816 4.30755 16.1857 4.64 15.9324C4.97307 15.6786 5.46613 15.5 6.04163 15.5C6.61713 15.5 7.11018 15.6786 7.44325 15.9324ZM19.9166 7.08212V4.9037L9.41663 6.87245V9.09276L19.9166 7.08212Z"
                        fill=""
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-gray-800 dark:text-white/90">
                      Audio
                    </h4>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      24% Used
                    </span>
                  </div>
                </div>
                <div>
                  <span className="mb-1 block text-right text-sm text-gray-500 dark:text-gray-400">
                    245 files
                  </span>
                  <span className="block text-right text-sm text-gray-500 dark:text-gray-400">
                    26.40 GB
                  </span>
                </div>
              </div>
              {/* Media item*/}
              <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white py-4 pl-4 pr-4 dark:border-gray-800 dark:bg-white/[0.03] xl:pr-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-orange-500/[0.08] text-orange-500">
                    <svg
                      className="fill-current"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V8.99998C3.25 10.2426 4.25736 11.25 5.5 11.25H9C10.2426 11.25 11.25 10.2426 11.25 8.99998V5.5C11.25 4.25736 10.2426 3.25 9 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H9C9.41421 4.75 9.75 5.08579 9.75 5.5V8.99998C9.75 9.41419 9.41421 9.74998 9 9.74998H5.5C5.08579 9.74998 4.75 9.41419 4.75 8.99998V5.5ZM5.5 12.75C4.25736 12.75 3.25 13.7574 3.25 15V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H9C10.2426 20.75 11.25 19.7427 11.25 18.5V15C11.25 13.7574 10.2426 12.75 9 12.75H5.5ZM4.75 15C4.75 14.5858 5.08579 14.25 5.5 14.25H9C9.41421 14.25 9.75 14.5858 9.75 15V18.5C9.75 18.9142 9.41421 19.25 9 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V15ZM12.75 5.5C12.75 4.25736 13.7574 3.25 15 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V8.99998C20.75 10.2426 19.7426 11.25 18.5 11.25H15C13.7574 11.25 12.75 10.2426 12.75 8.99998V5.5ZM15 4.75C14.5858 4.75 14.25 5.08579 14.25 5.5V8.99998C14.25 9.41419 14.5858 9.74998 15 9.74998H18.5C18.9142 9.74998 19.25 9.41419 19.25 8.99998V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H15ZM15 12.75C13.7574 12.75 12.75 13.7574 12.75 15V18.5C12.75 19.7426 13.7574 20.75 15 20.75H18.5C19.7426 20.75 20.75 19.7427 20.75 18.5V15C20.75 13.7574 19.7426 12.75 18.5 12.75H15ZM14.25 15C14.25 14.5858 14.5858 14.25 15 14.25H18.5C18.9142 14.25 19.25 14.5858 19.25 15V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15C14.5858 19.25 14.25 18.9142 14.25 18.5V15Z"
                        fill=""
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-gray-800 dark:text-white/90">
                      Apps
                    </h4>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      46% Used
                    </span>
                  </div>
                </div>
                <div>
                  <span className="mb-1 block text-right text-sm text-gray-500 dark:text-gray-400">
                    245 files
                  </span>
                  <span className="block text-right text-sm text-gray-500 dark:text-gray-400">
                    26.40 GB
                  </span>
                </div>
              </div>
              {/* Media item*/}
              <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white py-4 pl-4 pr-4 dark:border-gray-800 dark:bg-white/[0.03] xl:pr-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-warning-500/[0.08] text-warning-500">
                    <svg
                      className="fill-current"
                      width={25}
                      height={24}
                      viewBox="0 0 25 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M19.8335 19.75C19.8335 20.9926 18.8261 22 17.5835 22H7.0835C5.84086 22 4.8335 20.9926 4.8335 19.75V9.62105C4.8335 9.02455 5.07036 8.45247 5.49201 8.03055L10.8597 2.65951C11.2817 2.23725 11.8542 2 12.4512 2H17.5835C18.8261 2 19.8335 3.00736 19.8335 4.25V19.75ZM17.5835 20.5C17.9977 20.5 18.3335 20.1642 18.3335 19.75V4.25C18.3335 3.83579 17.9977 3.5 17.5835 3.5H12.5815L12.5844 7.49913C12.5853 8.7424 11.5776 9.75073 10.3344 9.75073H6.3335V19.75C6.3335 20.1642 6.66928 20.5 7.0835 20.5H17.5835ZM7.39262 8.25073L11.0823 4.55876L11.0844 7.5002C11.0847 7.91462 10.7488 8.25073 10.3344 8.25073H7.39262ZM8.5835 14.5C8.5835 14.0858 8.91928 13.75 9.3335 13.75H15.3335C15.7477 13.75 16.0835 14.0858 16.0835 14.5C16.0835 14.9142 15.7477 15.25 15.3335 15.25H9.3335C8.91928 15.25 8.5835 14.9142 8.5835 14.5ZM8.5835 17.5C8.5835 17.0858 8.91928 16.75 9.3335 16.75H12.3335C12.7477 16.75 13.0835 17.0858 13.0835 17.5C13.0835 17.9142 12.7477 18.25 12.3335 18.25H9.3335C8.91928 18.25 8.5835 17.9142 8.5835 17.5Z"
                        fill=""
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-gray-800 dark:text-white/90">
                      Docs
                    </h4>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      18% Used
                    </span>
                  </div>
                </div>
                <div>
                  <span className="mb-1 block text-right text-sm text-gray-500 dark:text-gray-400">
                    245 files
                  </span>
                  <span className="block text-right text-sm text-gray-500 dark:text-gray-400">
                    26.40 GB
                  </span>
                </div>
              </div>
              {/* Media item*/}
              <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white py-4 pl-4 pr-4 dark:border-gray-800 dark:bg-white/[0.03] xl:pr-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-theme-purple-500/[0.08] text-theme-purple-500">
                    <svg
                      className="fill-current"
                      width={25}
                      height={24}
                      viewBox="0 0 25 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12.6686 16.75C12.4526 16.75 12.2579 16.6587 12.1211 16.5126L7.5115 11.9059C7.21851 11.6131 7.21836 11.1382 7.51116 10.8452C7.80396 10.5523 8.27883 10.5521 8.57182 10.8449L11.9186 14.1896V4C11.9186 3.58579 12.2544 3.25 12.6686 3.25C13.0828 3.25 13.4186 3.58579 13.4186 4V14.1854L16.7615 10.8449C17.0545 10.5521 17.5294 10.5523 17.8222 10.8453C18.115 11.1383 18.1148 11.6131 17.8218 11.9059L13.2469 16.4776C13.1093 16.644 12.9013 16.75 12.6686 16.75ZM5.41663 16C5.41663 15.5858 5.08084 15.25 4.66663 15.25C4.25241 15.25 3.91663 15.5858 3.91663 16V18.5C3.91663 19.7426 4.92399 20.75 6.16663 20.75H19.1675C20.4101 20.75 21.4175 19.7426 21.4175 18.5V16C21.4175 15.5858 21.0817 15.25 20.6675 15.25C20.2533 15.25 19.9175 15.5858 19.9175 16V18.5C19.9175 18.9142 19.5817 19.25 19.1675 19.25H6.16663C5.75241 19.25 5.41663 18.9142 5.41663 18.5V16Z"
                        fill=""
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-gray-800 dark:text-white/90">
                      Downloads
                    </h4>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      16% Used
                    </span>
                  </div>
                </div>
                <div>
                  <span className="mb-1 block text-right text-sm text-gray-500 dark:text-gray-400">
                    245 files
                  </span>
                  <span className="block text-right text-sm text-gray-500 dark:text-gray-400">
                    26.40 GB
                  </span>
                </div>
              </div>
            </div>
          </div>

         

          {/* Staff Management Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Staff Management
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Manager Card */}
              <button
                type="button"
                className="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all duration-200 hover:border-brand-500 hover:shadow-lg"
              >
                <Link to={`/managers/${outletId}`}>
                  <div className="flex items-center justify-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-50">
                        <FontAwesomeIcon
                          icon={faUserGear}
                          className="w-6 h-6 text-gray-800 dark:text-white/90 group-hover:text-brand-500"
                        />
                      </div>
                      <div className="flex flex-col w-full sm:w-auto">
                        <span className="text-lg font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500 text-center sm:text-left">
                          Managers
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </button>

              {/* Chef Card */}
              <Link
                to={`/chefs/${outletId}`}
                className="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all duration-200 hover:border-brand-500 hover:shadow-lg"
              >
                <div className="flex items-center justify-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-50">
                      <FontAwesomeIcon
                        icon={faBowlFood}
                        className="w-6 h-6 text-gray-800 dark:text-white/90 group-hover:text-brand-500"
                      />
                    </div>
                    <div className="flex flex-col w-full sm:w-auto">
                      <span className="text-lg font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500 text-center sm:text-left">
                        Chefs
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Captain Card */}
              <Link
                to={`/captains/${outletId}`}
                className="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all duration-200 hover:border-brand-500 hover:shadow-lg"
              >
                <div className="flex items-center justify-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-50">
                      <FontAwesomeIcon
                        icon={faUserPen}
                        className="w-6 h-6 text-gray-800 dark:text-white/90 group-hover:text-brand-500"
                      />
                    </div>
                    <div className="flex flex-col w-full sm:w-auto">
                      <span className="text-lg font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500 text-center sm:text-left">
                        Captains
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Waiter Card */}
              <Link
                to={`/waiters/${outletId}`}
                className="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all duration-200 hover:border-brand-500 hover:shadow-lg"
              >
                <div className="flex items-center justify-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-50">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="w-6 h-6 text-gray-800 dark:text-white/90 group-hover:text-brand-500"
                      />
                    </div>
                    <div className="flex flex-col w-full sm:w-auto">
                      <span className="text-lg font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500 text-center sm:text-left">
                        Waiters
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Outlet Owners Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Outlet Owners
              </h2>
            </div>
            <div className="flex items-center justify-between pb-5">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {outletData?.owners?.map((owner, index) => (
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
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
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
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
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
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
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
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
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
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
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
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
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
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Outlet"
        type="error"
        size="small"
        actionButtons={
          <>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="inline-flex items-center gap-2 rounded-full bg-gray-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="inline-flex items-center gap-2 rounded-full bg-error-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-error-600"
            >
              Delete
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete this outlet? This action cannot be
          undone.
        </p>
      </Modal>

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
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleBulkUpload}
              disabled={!selectedFile || loading}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition ${
                selectedFile && !loading
                  ? "bg-success-500 hover:bg-success-600"
                  : "bg-success-500 opacity-50 cursor-not-allowed"
              }`}
            >
              <FontAwesomeIcon
                icon={loading ? faSpinner : faUpload}
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Uploading..." : "Upload"}
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
