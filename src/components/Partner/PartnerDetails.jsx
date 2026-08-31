import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { API_CONFIG } from "../../config/appConfig";
import Breadcrumb from "../Breadcrumb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faPenToSquare,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import ActiveSessionsTable from "../common/ActiveSessionsTable";
import StatusToggleButton from "../common/StatusToggleButton";
import { usePartnerDetails } from "../../lib/react-query/hooks/usePartnerDetails";
import { queryKeys } from "../../lib/react-query/queryKeys";
import { useAdmin } from "../../hooks/useAdmin";
import { useAuth } from "../../hooks/useAuth";
import { toastController } from "../../utils/toastController";
import AuditInfo from "../common/AuditInfo";

// Title-case helper: first letter capital for every word
const toTitleCase = (str) =>
  str
    ? String(str).replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      )
    : "";

function PartnerDetails() {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { BASE_URL } = API_CONFIG;
  const queryClient = useQueryClient();

  const { partner, isLoading, error, deletePartner, isDeleting, refetch } =
    usePartnerDetails(partnerId);

  // Local state for active sessions
  const [activeSessions, setActiveSessions] = useState(
    partner?.active_sessions || []
  );
  useEffect(() => {
    setActiveSessions(partner?.active_sessions || []);
  }, [partner?.active_sessions]);

  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const [isTogglingActive, setIsTogglingActive] = useState(false);

  const handleDelete = async () => {
    await deletePartner();
    setIsDeleteModalOpen(false);
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error?.message || "Failed to fetch partner details"}
      </div>
    );
  }

  // Add breadcrumb configuration
  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Partners", path: "/partners" },
    { label: "View", path: "#" },
  ];

  const handleLogout = async (device_id) => {
    // Find the session for this device_id to get app_type
    const session = activeSessions.find((s) => s.device_id === device_id);
    if (!session) return;
    try {
      const res = await fetch(`${BASE_URL}/admin/admin_logout_user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
        body: JSON.stringify({
          admin_id: adminData?.user_id,
          user_id: partner.user_id,
          app_type: session.app_type,
          device_id: session.device_id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveSessions((prev) =>
          prev.filter((s) => s.device_id !== device_id)
        );
        if (window.toastController) {
          window.toastController.success("Logout successful");
        } else {
          alert("Logout successful");
        }
      } else {
        if (window.toastController) {
          window.toastController.error(data.detail || "Logout failed");
        } else {
          alert(data.detail || "Logout failed");
        }
      }
    } catch {
      if (window.toastController) {
        window.toastController.error("Logout failed");
      } else {
        alert("Logout failed");
      }
    }
  };

  // Toggle Partner Active/Inactive
  const handleTogglePartnerActive = async () => {
    if (!partner?.partner_id && !partner?.user_id) return;
    const nextIsActive = partner.is_active === 1 ? 0 : 1;
    setIsTogglingActive(true);
    try {
      const token = getToken();
      const payload = {
        // Backend expects 'user_id' as the partner's id and 'update_user_id' as the actor
        user_id: Number(partner.partner_id || partner.user_id),
        update_user_id: adminData?.user_id,
        name: partner.name || partner.partner_name || "",
        email: partner.email || "",
        mobile: partner.mobile || "",
        is_active: nextIsActive,
        app_source: "admin",
      };
      const resp = await fetch(`${BASE_URL}/admin/update_partner`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(payload),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const message =
          data?.detail || data?.message || "Failed to update partner";
        toastController.error(message);
        throw new Error(message);
      }
      toastController.success(
        `Partner marked as ${nextIsActive === 1 ? "Active" : "Inactive"}`
      );
      // Immediately update the partners list cache so list view reflects new status
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.list() });
      // Refresh this detail view to pick up the latest data
      await refetch();
    } catch (e) {
      console.error("Failed to toggle partner active status", e);
    } finally {
      setIsTogglingActive(false);
    }
  };

  return (
    <>
      {/* Replace manual breadcrumb with Breadcrumb component */}
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* Header Section */}
        <div className="overflow-hidden pt-4">
          {/* Top Row - Back, Title, Edit */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div className="flex items-center gap-2 order-1">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center text-lg sm:text-xl font-semibold text-gray-800">
              Partner Details
            </div>

            {/* Right Side - Status, Edit, Delete */}
            <div className="flex items-center gap-2 order-3">
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
              <button
                onClick={() => navigate(`/edit-partner/${partnerId}`)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-warning-500 shadow-theme-xs hover:bg-warning-600"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-error-500 shadow-theme-xs hover:bg-error-600"
                disabled={isDeleting}
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
        </div>

        {/* Rest of the content */}
        {partner && (
          <>
            {/* Personal Information */}
            <div className="px-7 pb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
                {partner.name && (
                  <div>
                    <h4 className="text-sm font-normal text-gray-800 dark:text-white/90">
                      {toTitleCase(partner.name)}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Name
                    </p>
                  </div>
                )}
                {partner.email && (
                  <div>
                    <h4 className="text-sm font-normal text-gray-800 dark:text-white/90">
                      {partner.email}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email Address
                    </p>
                  </div>
                )}
                {partner.mobile && (
                  <div>
                    <h4 className="text-sm font-normal text-gray-800 dark:text-white/90">
                      {partner.mobile}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Mobile Number
                    </p>
                  </div>
                )}
                {partner.address && (
                  <div>
                    <h4 className="text-sm font-normal text-gray-800 dark:text-white/90">
                      {toTitleCase(partner.address)}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Address
                    </p>
                  </div>
                )}
                {partner.dob && (
                  <div>
                    <h4 className="text-sm font-normal text-gray-800 dark:text-white/90">
                      {(() => {
                        const date = new Date(partner.dob);
                        if (isNaN(date)) return partner.dob;
                        const day = String(date.getDate()).padStart(2, "0");
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const year = date.getFullYear();
                        return `${day}-${month}-${year}`;
                      })()}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Date of Birth
                    </p>
                  </div>
                )}
                {partner.aadhar_number && (
                  <div>
                    <h4 className="text-sm font-normal text-gray-800 dark:text-white/90">
                      {partner.aadhar_number}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Aadhar Number
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="p-6 border-t">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                Account Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
                {partner.role && (
                  <div>
                    <h4 className="text-sm font-normal text-gray-800 dark:text-white/90">
                      {toTitleCase(partner.role)}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Role
                    </p>
                  </div>
                )}

                {/* Active Status */}
                {partner.is_active !== null &&
                  partner.is_active !== undefined && (
                    <div className="mt-1 flex items-center gap-4">
                      <div>
                        <h4
                          className={`text-lg font-normal dark:text-white/90 ${
                            partner.is_active === 1
                              ? "text-success-700"
                              : "text-error-700"
                          }`}
                        >
                          {partner.is_active === 1 ? "Active" : "Inactive"}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Active Status
                        </p>
                      </div>
                      <div className="flex items-center">
                        <StatusToggleButton
                          isActive={partner.is_active === 1}
                          onToggle={handleTogglePartnerActive}
                          disabled={isTogglingActive}
                          activeLabel=""
                          inactiveLabel=""
                        />
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Functionalities */}
            {partner.functionalities && partner.functionalities.length > 0 && (
              <div className="p-6 border-t">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                  Functionalities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {partner.functionalities.map((func) => (
                    <span
                      key={func.functionality_id}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {func.functionality_name.replace(/_/g, " ").toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Active Sessions Section */}
            {activeSessions && activeSessions.length > 0 && (
              <div className="p-6 border-t">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                  Active Sessions
                </h2>
                <ActiveSessionsTable
                  activeSessions={activeSessions}
                  onLogout={handleLogout}
                  showAction={true}
                />
              </div>
            )}

            <div className="p-6 border-t">
              <AuditInfo
                createdOn={partner?.created_on}
                updatedOn={partner?.updated_on}
                createdBy={
                  partner?.created_by_name ||
                  partner?.created_by_full_name ||
                  partner?.created_by_user_name ||
                  partner?.created_by
                    ? toTitleCase(
                      partner?.created_by_name ||
                      partner?.created_by_full_name ||
                      partner?.created_by_user_name ||
                      partner?.created_by
                    )
                    : null
                }
                updatedBy={
                  partner?.updated_by_name ||
                  partner?.updated_by_full_name ||
                  partner?.updated_by_user_name ||
                  partner?.updated_by
                    ? toTitleCase(
                      partner?.updated_by_name ||
                      partner?.updated_by_full_name ||
                      partner?.updated_by_user_name ||
                      partner?.updated_by
                    )
                    : null
                }
              />
            </div>
          </>
        )}
      </div>
      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this partner?"
      />
    </>
  );
}

export default PartnerDetails;
