import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_CONFIG } from "../../config/appConfig";
import Breadcrumb from "../Breadcrumb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faCircleCheck,
  faCircleXmark,
  faPenToSquare,
  faTrash,
  faRotate,
  faUserCheck,
} from "@fortawesome/free-solid-svg-icons";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import ActiveSessionsTable from "../common/ActiveSessionsTable";
import { useAdminDetails } from "../../lib/react-query/hooks/useAdminDetails";
import { useAdmin } from "../../hooks/useAdmin";
import { useAuth } from "../../hooks/useAuth";
import { toastController } from "../../utils/toastController";
import StatusToggleButton from "../common/StatusToggleButton";
import AuditInfo from "../common/AuditInfo";

function AdminDetails() {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { BASE_URL } = API_CONFIG;

  const {
    admin,
    isLoading,
    error,
    refetch,
    deleteAdmin,
    isDeleting,
    formatDate,
    PROTECTED_MOBILES,
    updateAdmin,
    isUpdating: isTogglingActive,
  } = useAdminDetails(adminId);

  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const [activeSessions, setActiveSessions] = useState([]);
  useEffect(() => {
    if (admin && admin.active_sessions) {
      setActiveSessions(admin.active_sessions);
    }
  }, [admin && admin.active_sessions]);

  // Breadcrumb configuration
  const breadcrumbItems = [
    { label: "Home", path: "/Home" },
    { label: "Admins", path: "/admins" },
    { label: "Admin Details", path: `/admin-details/${adminId}` },
  ];

  // Handle delete with mutation
  const handleDeleteAdmin = async () => {
    deleteAdmin(null, {
      onSuccess: () => {
        navigate("/admins");
      },
    });
    setShowDeleteModal(false);
  };

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
          user_id: admin.user_id,
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
    } catch (err) {
      if (window.toastController) {
        window.toastController.error("Logout failed");
      } else {
        alert("Logout failed");
      }
    }
  };

  // Toggle Admin Active/Inactive
  const handleToggleAdminActive = async () => {
    if (!admin?.admin_id && !admin?.user_id) return;
    const nextIsActive = admin.is_active ? 0 : 1;

    updateAdmin(
      {
        user_id: adminData?.user_id,
        admin_id: Number(admin.admin_id || admin.user_id),
        name: admin.name || "",
        email: admin.email || "",
        mobile: admin.mobile || "",
        is_active: nextIsActive,
        role: admin.role || "admin",
        app_source: "admin",
      },
      {
        onSuccess: () => {
          toastController.success(
            `Admin marked as ${nextIsActive === 1 ? "Active" : "Inactive"}`
          );
        }
      }
    );
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
      <div className="p-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="mt-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!admin) return <div>Loading...</div>;

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          {/* Header Section */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center text-lg sm:text-xl font-semibold text-gray-800">
              Admin Details
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-2">
              {admin && !PROTECTED_MOBILES.includes(String(admin.mobile)) && (
                <>
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
                    onClick={() => navigate(`/edit-admin/${adminId}`)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full shadow-theme-xs bg-warning-500 hover:bg-warning-600"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-error-500 shadow-theme-xs hover:bg-error-600 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Admin Details Content */}
        <div className="px-4 pb-4">
          {/* Admin Details Card */}
          <div className="bg-white rounded-2xl overflow-hidden dark:border-gray-800 dark:bg-gray-900">
            {/* Basic Info Section */}
            <div className="p-6  border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-4">
                Admin Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                <div>
                  <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                    {admin.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Name
                  </p>
                </div>
                <div>
                  <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                    {admin.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                </div>
                <div>
                  <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                    {admin.mobile}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Mobile
                  </p>
                </div>
                {/* Account Status */}
                {admin.is_active !== null &&
                  admin.is_active !== undefined && (
                    <div className="flex items-center p-3 rounded-lg">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faUserCheck}
                          className="w-5 h-5 text-gray-400"
                        />
                      </div>
                      <div className="ml-3">
                        <StatusToggleButton
                          isActive={admin.is_active}
                          onToggle={handleToggleAdminActive}
                          disabled={
                            isTogglingActive ||
                            (admin &&
                              PROTECTED_MOBILES.includes(String(admin.mobile)))
                          }
                        />
                        <div className="text-sm text-gray-500">Account Status</div>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Active Sessions Section */}
            {activeSessions && activeSessions.length > 0 && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 ">
                  Active Sessions
                </h3>
                <ActiveSessionsTable
                  activeSessions={activeSessions}
                  onLogout={handleLogout}
                  showAction={
                    admin && !PROTECTED_MOBILES.includes(String(admin.mobile))
                  }
                />
              </div>
            )}

            <div className="px-6 pb-5">
              <AuditInfo
                createdOn={admin?.created_on}
                updatedOn={admin?.updated_on}
                createdBy={
                  admin?.created_by_name ||
                  admin?.created_by_full_name ||
                  admin?.created_by_user_name ||
                  admin?.created_by
                }
                updatedBy={
                  admin?.updated_by_name ||
                  admin?.updated_by_full_name ||
                  admin?.updated_by_user_name ||
                  admin?.updated_by
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteAdmin}
      />
    </>
  );
}

export default AdminDetails;


