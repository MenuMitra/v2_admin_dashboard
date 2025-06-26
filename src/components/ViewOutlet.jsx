import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useAdmin } from "../hooks/useAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faUserGroup,
  faUserGear,
  faChevronLeft,
  faEdit,
  faTrash,
  faStore,
  faPhone,
  faLocationDot,
  faBowlFood,
  faPercent,
  faClock,
  faIdCard,
  faFileInvoice,
  faQrcode,
  faBook,
  faListUl,
  faTableCells,
  faReceipt,
  faTable,
  faCalendarPlus,
  faUser,
  faCalendarCheck,
  faUserPen,
  faMessage,
  faUsers,
  faChevronUp,
  faChevronRight,
  faUpload,
  faInfoCircle,
  faDownload,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useParams, useNavigate, Link } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import Modal from "./common/Modal";

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

  const fetchOutletDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        "https://men4u.xyz/v2/common/view_outlet",
        {
          outlet_id: outletId,
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
      const response = await axios.delete(
        "https://men4u.xyz/v2/common/delete_outlet",
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
          data: {
            outlet_id: outletId,
            user_id: adminData?.user_id,
          },
        }
      );

      if (response.data.detail === "Outlet deleted successfully") {
        setShowDeleteModal(false);
        navigate("/outlets");
      }
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

  const handleBulkUpload = () => {
    console.log("Selected file:", selectedFile);
    setShowBulkUploadModal(false);
    setSelectedFile(null);
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const templateUrl = '/downloads/bulk_template.csv';
      
      // Fetch the file first to check if it exists
      const response = await fetch(templateUrl);
      
      if (!response.ok) {
        throw new Error('Template file not found');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bulk_template.csv';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
      // You can add a toast notification here if you have one
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
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                {outletData?.name || "View Outlet"}
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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Menu Management
            </h2>
            <button
              onClick={() => setShowBulkUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 hover:bg-brand-600 shadow-theme-xs"
            >
              <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
              <span>Bulk Upload</span>
            </button>
          </div>
          {/* Stats and Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {/* Categories and Menus Cards */}
            <Link
              to={`/categories/${outletId}`}
              className="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all duration-200 hover:border-brand-500 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-50">
                    <FontAwesomeIcon
                      icon={faListUl}
                      className="w-6 h-6 text-gray-800 dark:text-white/90 group-hover:text-brand-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Manage
                    </span>
                    <span className="text-lg font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500">
                      Categories
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to={`/menus/${outletId}`}
              className="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all duration-200 hover:border-brand-500 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-50">
                    <FontAwesomeIcon
                      icon={faUtensils}
                      className="w-6 h-6 text-gray-800 dark:text-white/90 group-hover:text-brand-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Manage
                    </span>
                    <span className="text-lg font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500">
                      Menus
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Staff Management Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Staff Management
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              
               {/* Manager Card */}
              
              <button type="button" class="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all duration-200 hover:border-brand-500 hover:shadow-lg"><Link
                to={`/managers/${outletId}`}
                
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-50">
                      <FontAwesomeIcon
                        icon={faUserGear}
                        className="w-6 h-6 text-gray-800 dark:text-white/90 group-hover:text-brand-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500">
                        Managers
                      </span>
                    </div>
                  </div>
                </div>
              </Link></button>
            

              

              {/* Chef Card */}
              <Link
                to={`/chefs/${outletId}`}
                className="group rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all duration-200 hover:border-brand-500 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-50">
                      <FontAwesomeIcon
                        icon={faBowlFood}
                        className="w-6 h-6 text-gray-800 dark:text-white/90 group-hover:text-brand-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Staff
                      </span>
                      <span className="text-lg font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-50">
                      <FontAwesomeIcon
                        icon={faUserPen}
                        className="w-6 h-6 text-gray-800 dark:text-white/90 group-hover:text-brand-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Staff
                      </span>
                      <span className="text-lg font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-50">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="w-6 h-6 text-gray-800 dark:text-white/90 group-hover:text-brand-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Staff
                      </span>
                      <span className="text-lg font-semibold text-gray-800 dark:text-white/90 group-hover:text-brand-500">
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
                        <span>{owner.owner_name}</span>
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
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
                      {outletData?.name}
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
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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

          {/* Manage Staff Details section with divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Manage Staff Details
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
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
        title="Bulk Upload Menu Items"
        type="default"
        size="small"
        actionButtons={
          <>
            <button
              onClick={() => {
                setShowBulkUploadModal(false);
                setSelectedFile(null);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-gray-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkUpload}
              disabled={!selectedFile}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition ${
                selectedFile
                  ? "bg-success-500 hover:bg-success-600"
                  : "bg-success-500 opacity-50 cursor-not-allowed"
              }`}
            >
              <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
              Upload
            </button>
          </>
        }
      >
        <div className="p-4">
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
                Please ensure your CSV file follows the template format. Any deviation may result in upload failure.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
              className={`inline-flex items-center gap-2 text-sm font-medium ${
                isDownloading 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-brand-500 hover:text-brand-600'
              }`}
            >
              <FontAwesomeIcon 
                icon={isDownloading ? faSpinner : faDownload} 
                className={`h-4 w-4 ${isDownloading ? 'animate-spin' : ''}`} 
              />
              {isDownloading ? 'Downloading...' : 'Download Template'}
            </button>
            <span className="text-sm text-gray-500">
              {selectedFile ? `Selected: ${selectedFile.name}` : "No file selected"}
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ViewOutlet;