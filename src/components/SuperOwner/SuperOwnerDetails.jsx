/**
 * SuperOwnerDetails.jsx - Super Owner Details View Component
 * 
 * This component displays comprehensive information about a super owner including:
 * - Personal information (name, email, mobile, aadhar, etc.)
 * - Account information (status, role, creation/update details)
 * - Associated outlets with navigation links
 * - Active sessions with logout functionality
 * - Access functionalities as tags
 * 
 * Features:
 * - Real-time status toggle
 * - Active session management
 * - Delete functionality with confirmation
 * - Responsive information display
 * - Navigation to related entities
 * 

 

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_CONFIG } from "../../config/appConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faUser,
  faEnvelope,
  faPhone,
  faBirthdayCake,
  faIdCard,
  faLocationDot,
  faUserTag,
  faUserCheck,
  faCalendarPlus,
  faCalendarCheck,
  faStore,
  faChevronRight,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import ActiveSessionsTable from "../common/ActiveSessionsTable";
import StatusToggleButton from "../common/StatusToggleButton";
import { useSuperOwnerDetails } from "../../lib/react-query/hooks/useSuperOwnerDetails";
import { useAdmin } from "../../hooks/useAdmin";
import { useAuth } from "../../hooks/useAuth";
import { toastController } from "../../utils/toastController";


 * Utility function to convert strings to title case
 * Capitalizes the first letter of each word

 
const toTitleCase = (str) =>
  str
    ? String(str).replace(/\w\S g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    : "";

/**
 * SuperOwnerDetails component for displaying detailed super owner information
 * Provides comprehensive view with management capabilities
 * returns {JSX.Element} The super owner details interface
 
function SuperOwnerDetails() {
  // Hooks for authentication and data management
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const { superOwnerId } = useParams();
  const navigate = useNavigate();
  
  // UI state management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const { BASE_URL } = API_CONFIG;

  // Data fetching with React Query
  const {
    superOwnerDetails,
    isLoading,
    error,
    deleteSuperOwner,
    isDeleting,
    refetch,
  } = useSuperOwnerDetails(superOwnerId);

  // Local state for active sessions - moved to top to avoid conditional hooks
  const [activeSessions, setActiveSessions] = useState([]);

  /**
   * Memoized breadcrumb items for navigation
   * Prevents unnecessary re-renders
   
  const breadcrumbItems = useMemo(() => [
    { label: "Home", path: "/Home" },
    { label: "Super Owners", path: "/super-owners" },
    {
      label: "Super Owner Details",
      path: `/super-owner-details/${superOwnerId}`,
    },
  ], [superOwnerId]);

  /**
   * Navigate back to previous page
   
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  /**
   * Handle super owner deletion
   * Shows confirmation modal and deletes on confirmation
   
  const handleDelete = useCallback(async () => {
    await deleteSuperOwner();
    setIsModalOpen(false);
    navigate("/super-owners");
  }, [deleteSuperOwner, navigate]);

  /**
   * Toggle super owner active/inactive status
   * Updates the status via API and refreshes data
   
  const handleToggleSuperOwnerActive = useCallback(async () => {
    if (!superOwnerDetails?.superOwnerData?.super_owner_id) return;
    
    const current = superOwnerDetails.superOwnerData.is_active;
    const nextIsActive = current === 1 || current === true ? false : true;
    
    setIsTogglingActive(true);
    
    try {
      const response = await fetch(`${BASE_URL}/admin/update_super_owner`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
        body: JSON.stringify({
          user_id: adminData?.user_id,
          super_owner_id: parseInt(superOwnerId),
          name: superOwnerDetails.superOwnerData.name || "",
          mobile: superOwnerDetails.superOwnerData.mobile || "",
          email: superOwnerDetails.superOwnerData.email || "",
          aadhar_number: superOwnerDetails.superOwnerData.aadhar_number || "",
          is_active: nextIsActive,
          app_source: "admin",
        }),
      });
      
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        const message = data?.detail || data?.message || "Failed to update super owner";
        toastController.error(message);
        throw new Error(message);
      }
      
      toastController.success(
        `Super owner marked as ${nextIsActive ? "Active" : "Inactive"}`
      );
      
      if (typeof refetch === "function") {
        await refetch();
      }
    } catch (error) {
      // Error already handled above
      console.error("Toggle status error:", error);
    } finally {
      setIsTogglingActive(false);
    }
  }, [
    superOwnerDetails?.superOwnerData,
    BASE_URL,
    getToken,
    adminData?.user_id,
    superOwnerId,
    refetch
  ]);

  /**
   * Update active sessions when superOwnerData changes
   * Flattens active sessions from all assigned outlets
   
  useEffect(() => {
    if (superOwnerDetails?.assignedOutlets && superOwnerDetails.assignedOutlets.length > 0) {
      // Flatten all active sessions from all outlets
      const allSessions = superOwnerDetails.assignedOutlets.flatMap(
        (outlet) => outlet.active_sessions || []
      );
      setActiveSessions(allSessions);
    } else {
      setActiveSessions([]);
    }
  }, [superOwnerDetails?.assignedOutlets]);

  /**
   * Handle user logout from specific device
   * param {string} device_id - Device ID to logout from
   
  const handleLogout = useCallback(async (device_id) => {
    // Find the session for this device_id to get app_type
    const session = activeSessions.find((s) => s.device_id === device_id);
    if (!session) return;
    
    try {
      const response = await fetch(`${BASE_URL}/admin/admin_logout_user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
        body: JSON.stringify({
          admin_id: adminData?.user_id,
          user_id: superOwnerDetails.superOwnerData.super_owner_id,
          app_type: session.app_type,
          device_id: session.device_id,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setActiveSessions((prev) =>
          prev.filter((s) => s.device_id !== device_id)
        );
        toastController.success("Logout successful");
      } else {
        toastController.error(data.detail || "Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toastController.error("Logout failed");
    }
  }, [activeSessions, BASE_URL, getToken, adminData?.user_id, superOwnerDetails?.superOwnerData?.super_owner_id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-error-500 mb-4">Failed to load super owner details</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!superOwnerDetails?.superOwnerData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-500">
          <p>No super owner data found</p>
          <button
            onClick={() => navigate("/super-owners")}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Back to Super Owners
          </button>
        </div>
      </div>
    );
  }

  const {
    superOwnerData,
    assignedOutlets,
    assignedFunctionalities,
    totalOutlets,
    totalFunctionalities,
  } = superOwnerDetails;

  return (
    <>
      {/* Navigation breadcrumb }
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          {/* Header Section - Matching DataTable.jsx style }
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button }
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title }
            <div className="flex-1 text-center text-base sm:text-lg font-semibold text-gray-800">
              Super Owner Details
            </div>

            {/* Right Side - Action Buttons }
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
                <span className="hidden sm:inline">Reload</span>
              </button>
              <button
                onClick={() => {
                  if (superOwnerData?.super_owner_id) {
                    navigate(`/edit-super-owner/${superOwnerData.super_owner_id}`);
                  } else {
                    toastController.error('Unable to edit: Super owner ID not found');
                  }
                }}
                disabled={!superOwnerData?.super_owner_id}
                className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full shadow-theme-xs ${
                  superOwnerData?.super_owner_id 
                    ? 'bg-warning-500 hover:bg-warning-600' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-error-500 shadow-theme-xs hover:bg-error-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>

          {/* Content Section }
          <div className="px-6 py-4">
            {/* Personal Information Card }
            <h2 className="text-base font-medium mb-4 text-gray-800">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {/* Name}
              {superOwnerData.name && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {toTitleCase(superOwnerData.name)}
                    </div>
                    <div className="text-sm text-gray-500">Name</div>
                  </div>
                </div>
              )}

              {/* Email }
              {superOwnerData.email && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.email}
                    </div>
                    <div className="text-sm text-gray-500">Email</div>
                  </div>
                </div>
              )}

              {/* Mobile }
              {superOwnerData.mobile && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.mobile}
                    </div>
                    <div className="text-sm text-gray-500">Mobile</div>
                  </div>
                </div>
              )}

              {/* Date of Birth }
              {superOwnerData.dob && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faBirthdayCake}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.dob}
                    </div>
                    <div className="text-sm text-gray-500">Date of Birth</div>
                  </div>
                </div>
              )}

              {/* Aadhar Number }
              {superOwnerData.aadhar_number && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faIdCard}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.aadhar_number}
                    </div>
                    <div className="text-sm text-gray-500">Aadhar Number</div>
                  </div>
                </div>
              )}

              {/* Address }
              {superOwnerData.address && (
                <div className="mt-3 flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faLocationDot}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.address}
                    </div>
                    <div className="text-sm text-gray-500">Address</div>
                  </div>
                </div>
              )}
            </div>

            {/* Account Information Card }
            <h2 className="text-base font-medium mb-4 text-gray-800">
              Account Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {/* Role }
              {superOwnerData.role && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUserTag}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.role}
                    </div>
                    <div className="text-sm text-gray-500">Role</div>
                  </div>
                </div>
              )}

              {/* Account Type }
              {superOwnerData.account_type && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUserTag}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.account_type?.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-500">Account Type</div>
                  </div>
                </div>
              )}

              {/* Account Status }
              {superOwnerData.is_active !== null &&
                superOwnerData.is_active !== undefined && (
                  <div className="flex items-center p-3 rounded-lg">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faUserCheck}
                        className="w-5 h-5 text-gray-400"
                      />
                    </div>
                    <div className="ml-2 flex items-center">
                      <div>
                        <p
                          className={`text-base font-medium ${
                            superOwnerData.is_active === 1 || superOwnerData.is_active === true
                              ? "text-success-700"
                              : "text-error-700"
                          }`}
                        >
                          {(superOwnerData.is_active === 1 || superOwnerData.is_active === true) ? "Active" : "Inactive"}
                        </p>
                        <div className="text-sm text-gray-500">Account Status</div>
                      </div>
                      <div className="ml-2">
                        <StatusToggleButton
                          isActive={superOwnerData.is_active === 1 || superOwnerData.is_active === true}
                          onToggle={handleToggleSuperOwnerActive}
                          disabled={isTogglingActive}
                          activeLabel=""
                          inactiveLabel=""
                        />
                      </div>
                    </div>
                  </div>
                )}

              {/* Created On }
              {superOwnerData.created_on && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCalendarPlus}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.created_on || "-"}
                    </div>
                    <div className="text-sm text-gray-500">Created On</div>
                  </div>
                </div>
              )}

              {/* Created By }
              {superOwnerData.created_by && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCalendarPlus}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {toTitleCase(superOwnerData.created_by) || "-"}
                    </div>
                    <div className="text-sm text-gray-500">Created By</div>
                  </div>
                </div>
              )}

              {/* Updated On }
              {superOwnerData.updated_on && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCalendarCheck}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {superOwnerData.updated_on}
                    </div>
                    <div className="text-sm text-gray-500">Updated On</div>
                  </div>
                </div>
              )}

              {/* Updated By }
              {superOwnerData.updated_by && (
                <div className="flex items-center p-3 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faCalendarCheck}
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium">
                      {toTitleCase(superOwnerData.updated_by)}
                    </div>
                    <div className="text-sm text-gray-500">Updated By</div>
                  </div>
                </div>
              )}
            </div>

            {/* Add new Outlets section }
            {assignedOutlets && assignedOutlets.length > 0 && (
              <div className="mt-8">
                <h2 className="text-base font-medium mb-4 text-gray-800">
                  Associated Outlets
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {assignedOutlets.map((outlet) => (
                    <div
                      key={outlet.outlet_id}
                      onClick={() =>
                        navigate(`/view-outlet/${outlet.outlet_id}`)
                      }
                      className="group flex items-center p-4 rounded-xl border border-gray-200 
                        hover:border-brand-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <div
                        className="w-10 h-10 flex items-center justify-center rounded-lg 
                        bg-gray-100 group-hover:bg-brand-50"
                      >
                        <FontAwesomeIcon
                          icon={faStore}
                          className="w-5 h-5 text-gray-600 group-hover:text-brand-500"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div
                          className="text-base font-medium text-gray-900 group-hover:text-brand-600 
                          flex items-center"
                        >
                          {outlet.outlet_name}
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="w-4 h-4 text-gray-400 group-hover:text-brand-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Sessions Section }
            {activeSessions && activeSessions.length > 0 && (
              <div className="mt-8">
                <h2 className="text-base font-medium mb-4 text-gray-800">
                  Active Sessions
                </h2>
                <ActiveSessionsTable
                  activeSessions={activeSessions}
                  lastLogin={superOwnerData?.last_login}
                  onLogout={handleLogout}
                  showAction={true}
                />
              </div>
            )}

            {/* Add new Functionalities section }
            {assignedFunctionalities && assignedFunctionalities.length > 0 && (
              <div className="mt-8">
                <h2 className="text-base font-medium mb-4 text-gray-800">
                  Access Functionalities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {assignedFunctionalities.map((func) => (
                    <div
                      key={func.functionality_id}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm
                        bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {func.functionality_name
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete confirmation modal }
        <DeleteConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onDelete={handleDelete}
          title="Confirm Delete"
          message="Are you sure you want to delete this super owner? This action cannot be undone."
          isLoading={isDeleting}
        />
      </div>
    </>
  );
}

export default SuperOwnerDetails;

*/