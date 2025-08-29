import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import { useSuperOwnerDetails } from "../../lib/react-query/hooks/useSuperOwnerDetails";
import { useAdmin } from "../../hooks/useAdmin";
import { useAuth } from "../../hooks/useAuth";

function SuperOwnerDetails() {
  const { adminData } = useAdmin();
  const { getToken } = useAuth();
  const { superOwnerId } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { superOwnerDetails, isLoading, error, deleteSuperOwner, isDeleting } =
    useSuperOwnerDetails(superOwnerId);

  // Local state for active sessions - moved to top to avoid conditional hooks
  const [activeSessions, setActiveSessions] = useState([]);

  // Add breadcrumb items
  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Super Owners", path: "/super-owners" },
    { label: "Details" },
  ];

  const handleBack = () => {
    navigate(-1);
  };

  const handleDelete = async () => {
    await deleteSuperOwner();
    setIsModalOpen(false);
    navigate("/super-owners");
  };

  // Update active sessions when superOwnerData changes
  useEffect(() => {
    if (superOwnerDetails?.superOwnerData?.active_sessions) {
      setActiveSessions(superOwnerDetails.superOwnerData.active_sessions);
    }
  }, [superOwnerDetails?.superOwnerData?.active_sessions]);

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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading super owner details
        </div>
      </div>
    );
  }

  if (!superOwnerDetails?.superOwnerData) {
    return (
      <div className="p-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          No super owner data available
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

  const handleLogout = async (device_id) => {
    // Find the session for this device_id to get app_type
    const session = activeSessions.find((s) => s.device_id === device_id);
    if (!session) return;
    try {
      const res = await fetch("https://ghanish.in/v2/admin/admin_logout_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
        body: JSON.stringify({
          admin_id: adminData?.user_id,
          user_id: superOwnerData.super_owner_id,
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

  return (
    <>
      {/* Add Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Replace the existing header with DataTable-style header */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          {/* Top Row - Back, Title, Actions */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div className="flex items-center gap-2 order-1">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="chevron-left"
                  className="svg-inline--fa fa-chevron-left w-4 h-4"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 320 512"
                >
                  <path
                    fill="currentColor"
                    d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
                  ></path>
                </svg>
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center text-lg sm:text-xl font-semibold text-gray-800">
              Super Owner Details
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center justify-end order-3">
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    navigate(
                      `/edit-super-owner/${superOwnerData.super_owner_id}`
                    )
                  }
                  className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-brand-500 hover:bg-brand-600 shadow-theme-xs"
                  style={{ backgroundColor: "#f7941d" }}
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full bg-error-500 hover:bg-error-600 shadow-theme-xs"
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
        </div>

        {/* Content Section */}
        <div className="bg-white p-6">
          {/* Basic Information Section */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div className="p-4">
                <p className="text-sm font-medium text-gray-800 mb-1">
                  {superOwnerData.name}
                </p>
                <p className="text-sm text-gray-500">Name</p>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-800 mb-1">
                  {superOwnerData.email}
                </p>
                <p className="text-sm text-gray-500">Email</p>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-800 mb-1">
                  {superOwnerData.mobile}
                </p>
                <p className="text-sm text-gray-500">Mobile</p>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-800 mb-1">
                  {superOwnerData.aadhar_number}
                </p>
                <p className="text-sm text-gray-500">Aadhar Number</p>
              </div>
            </div>
          </div>

          {/* Assigned Outlets Section */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">
              Assigned Outlets ({totalOutlets})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {assignedOutlets.map((outlet) => (
                <Link
                  key={outlet.outlet_id}
                  to={`/view-outlet/${outlet.outlet_id}`}
                  className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                >
                  <h4 className="text-sm font-medium mb-1 text-gray-800 hover:text-brand-600">
                    {outlet.outlet_name}
                  </h4>
                </Link>
              ))}
            </div>
          </div>

          {/* Assigned Functionalities Section */}
          <div>
            <h3 className="text-sm font-semibold mb-4">
              Assigned Functionalities ({totalFunctionalities})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {assignedFunctionalities.map((func) => (
                <div key={func.functionality_id} className="p-4">
                  <p className="text-sm font-medium mb-1">
                    {func.functionality_name}
                  </p>
                  <p className="text-sm text-gray-500">Functionality</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status Information Section */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold mb-4">Status Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <div className="p-4">
                <div className="mt-1 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={
                      superOwnerData.is_active ? faCircleCheck : faCircleXmark
                    }
                    className={`w-5 h-5 ${
                      superOwnerData.is_active
                        ? "text-success-500"
                        : "text-error-500"
                    }`}
                  />
                  <span
                    className={`text-base font-medium ${
                      superOwnerData.is_active
                        ? "text-success-700"
                        : "text-error-700"
                    }`}
                  >
                    {superOwnerData.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Account Status</p>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-800 mb-1">
                  {superOwnerData.created_on}
                </p>
                <p className="text-sm text-gray-500">Created On</p>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-gray-800 mb-1">
                  {superOwnerData.updated_on}
                </p>
                <p className="text-sm text-gray-500">Last Updated</p>
              </div>
            </div>
          </div>

          {/* Active Sessions Section */}
          {activeSessions && activeSessions.length > 0 && (
            <div className="mt-8">
              <h2 className="text-base font-medium mb-4 text-gray-800">
                Active Sessions
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
                        Device ID
                      </th>
                      <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
                        Device Model
                      </th>
                      <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
                        App Type
                      </th>
                      <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
                        Last Activity
                      </th>
                      <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
                        Last Login
                      </th>
                      <th className="px-4 py-2 border-b text-left text-xs font-semibold text-gray-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeSessions.map((session, idx) => (
                      <tr key={idx} className="border-b last:border-b-0">
                        <td className="px-4 py-2">
                          {session.device_id || "-"}
                        </td>
                        <td className="px-4 py-2">
                          {session.device_model || "-"}
                        </td>
                        <td className="px-4 py-2">{session.app_type || "-"}</td>
                        <td className="px-4 py-2">
                          {session.last_activity || "-"}
                        </td>
                        <td className="px-4 py-2">
                          {session.last_login || "-"}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
                            onClick={() => handleLogout(session.device_id)}
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="w-4 h-4"
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Use reusable DeleteConfirmModal */}
      <DeleteConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={handleDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this super owner?"
      />
    </>
  );
}

export default SuperOwnerDetails;
