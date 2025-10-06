import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Breadcrumb from "../../../Breadcrumb";
import { useAuth } from "../../../../hooks/useAuth";
import { useAdmin } from "../../../../hooks/useAdmin";
import { API_CONFIG } from "../../../../config/appConfig";
import { toastController } from "../../../../utils/toastController";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faPenToSquare,
  faCircleCheck,
  faCircleXmark,
  faRotate,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import ActiveSessionsTable from "../../../common/ActiveSessionsTable";
import DeleteConfirmModal from "../../../common/DeleteConfirmModal/DeleteConfirmModal";

function StaffDetails() {
  const { outletId, userId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [outletName, setOutletName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["staff_view", outletId, userId],
    queryFn: async () => {
      const token = getToken();
      const res = await axios.post(
        `${BASE_URL}/common/staff_view`,
        {
          staff_id: Number(userId),
          outlet_id: Number(outletId),
          user_id: adminData.user_id,
          app_source: "admin_app",
        },
        { headers: { Authorization: token } }
      );
      return res.data?.data;
    },
    enabled:
      Boolean(outletId) && Boolean(userId) && Boolean(adminData?.user_id),
  });

  const breadcrumbItems = useMemo(
    () => [
      { label: "Home", path: "/home" },
      { label: "Outlets", path: "/outlets" },
      {
        label: outletName || data?.outlet_name || `Outlet ${outletId}`,
        path: `/view-outlet/${outletId}`,
      },
      { label: "Staff", path: `/staff/${outletId}` },
      { label: "Staff Details" },
    ],
    [outletId, outletName, data?.outlet_name]
  );

  // Fetch outlet name if not available in staff data
  useEffect(() => {
    let cancelled = false;
    const fetchOutletName = async () => {
      if (!outletId || !adminData?.user_id) return;
      try {
        const token = getToken();
        const res = await axios.post(
          `${BASE_URL}/common/view_outlet`,
          {
            outlet_id: Number(outletId),
            user_id: adminData.user_id,
            app_source: "admin_app",
          },
          { headers: { Authorization: token } }
        );
        const o = res.data?.data;
        if (!cancelled && o) {
          setOutletName(o.name || o.outlet_name || "");
        }
      } catch (e) {
        // ignore
      }
    };
    // only fetch if breadcrumb doesn't already have a name
    if (!data?.outlet_name && !outletName) fetchOutletName();
    return () => {
      cancelled = true;
    };
  }, [
    outletId,
    adminData,
    getToken,
    BASE_URL,
    API_VERSION,
    data?.outlet_name,
    outletName,
  ]);

  // Prepare assigned actions for display: prefer `assigned_actions`, fall back to `functionalities`
  const assignedActions = (() => {
    if (
      Array.isArray(data?.assigned_actions) &&
      data.assigned_actions.length > 0
    ) {
      return data.assigned_actions
        .map((a) => ({
          id: a.action_id ?? a.actionId ?? null,
          name: a.action_name ?? a.actionName ?? a.feature_name ?? "",
        }))
        .filter((x) => x.id !== null);
    }
    if (
      Array.isArray(data?.functionalities) &&
      data.functionalities.length > 0
    ) {
      return data.functionalities
        .map((f) => ({
          id: f.functionality_id ?? f.id ?? null,
          name: f.functionality_name ?? f.name ?? "",
        }))
        .filter((x) => x.id !== null);
    }
    return [];
  })();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-error-500">
        {error.response?.data?.detail || "Failed to load staff details"}
      </div>
    );
  }

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          <div className="flex items-center px-6 mb-3">
            <div className="flex items-center gap-2 order-1">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
            <div className="flex-1 text-center text-lg sm:text-xl font-semibold text-gray-800">
              Staff Details
            </div>
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
                onClick={() => navigate(`/edit-staff/${outletId}/${userId}`)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                style={{ backgroundColor: "#f7941d" }}
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
            </div>
          </div>
        </div>

        {data && (
          <>
            <div className="px-4 pb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
                <Info label="Name" value={data?.name} />
                <Info label="Mobile" value={data?.mobile} />
                <Info label="Role" value={data?.role} />
                {data?.dob && <Info label="DOB" value={data?.dob} />}
                <Info label="Aadhar Number" value={data?.aadhar_number} />
                {data?.address && (
                  <Info label="Address" value={data?.address} />
                )}
                <DeleteConfirmModal
                  isOpen={showDeleteModal}
                  onClose={() => setShowDeleteModal(false)}
                  onDelete={async () => {
                    try {
                      setIsDeleting(true);
                      const token = getToken();
                      await toastController.promise(
                        // axios.delete takes (url, config) where payload must be under `data` key
                        axios.delete(
                          `${BASE_URL}/common/delete_staff`,
                          {
                            data: {
                              staff_id: Number(userId),
                              outlet_id: Number(outletId),
                              user_id: adminData.user_id,
                              app_source: "admin_app",
                            },
                            headers: { Authorization: token },
                          }
                        ),
                        {
                          loading: "Deleting staff...",
                          success: "Staff deleted successfully",
                          error: "Failed to delete staff",
                        }
                      );
                      setShowDeleteModal(false);
                      // Invalidate staff cache to refresh the list
                      queryClient.invalidateQueries(['staff', outletId]);
                      navigate(-1);
                    } catch (e) {
                      // error is handled by toastController
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                />
              </div>
            </div>

            <div className="p-6 border-t">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                Account Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
                <div>
                  <div className="mt-1 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={
                        data?.is_active === 1 ? faCircleCheck : faCircleXmark
                      }
                      className={`w-5 h-5 ${
                        data?.is_active === 1
                          ? "text-success-500"
                          : "text-error-500"
                      }`}
                    />
                    <span
                      className={`text-base font-medium ${
                        data?.is_active === 1
                          ? "text-success-700"
                          : "text-error-700"
                      }`}
                    >
                      {data?.is_active === 1 ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Active Status
                  </p>
                </div>
                {data?.created_on && (
                  <Info label="Created On" value={data?.created_on} />
                )}
                {data?.updated_on && (
                  <Info label="Updated On" value={data?.updated_on} />
                )}
                {data?.last_login && (
                  <Info label="Last Login" value={data?.last_login} />
                )}
              </div>
            </div>

            {assignedActions.length > 0 && (
              <div className="p-6 border-t">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                  Assigned Actions
                </h2>
                <div className="flex flex-wrap gap-2">
                  {assignedActions.map((act) => (
                    <span
                      key={act.id}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {String(act.name).replace(/_/g, " ").toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Active Sessions Section - follow Partner/Owner pattern */}
            {data?.active_sessions && (
              <div className="p-6 border-t">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                  Active Sessions
                </h2>
                <ActiveSessionsTable
                  activeSessions={data.active_sessions}
                  lastLogin={data.last_login}
                  onLogout={(deviceId) => {
                    // delegate to existing partner/owner style logout if needed
                    // no-op here; you can implement logout via API similar to OwnerDetails
                    console.log("Logout requested for", deviceId);
                  }}
                  showAction={true}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-gray-800 font-medium">{value || "-"}</div>
    </div>
  );
}

export default StaffDetails;
