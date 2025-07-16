import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../Breadcrumb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faCircleCheck,
  faCircleXmark,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import DeleteConfirmModal from '../common/DeleteConfirmModal/DeleteConfirmModal';
import { useAdminDetails } from "../../lib/react-query/hooks/useAdminDetails";

function AdminDetails() {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    admin,
    isLoading,
    error,
    deleteAdmin,
    isDeleting,
    formatDate,
    PROTECTED_MOBILES,
  } = useAdminDetails(adminId);

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
              {admin && !PROTECTED_MOBILES.includes(admin.mobile) && (
                <>
                  <button
                    onClick={() => navigate(`/edit-admin/${adminId}`)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white transition rounded-full shadow-theme-xs hover:brightness-110"
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
                </>
              )}
            </div>
          </div>
        </div>

        {/* Admin Details Content */}
        <div className="p-6">
          {/* Admin Details Card */}
          <div className="bg-white rounded-2xl overflow-hidden dark:border-gray-800 dark:bg-gray-900">
            {/* Basic Info Section */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
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
                <div>
                  <div className="mt-1 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={admin.is_active ? faCircleCheck : faCircleXmark}
                      className={`w-5 h-5 ${
                        admin.is_active ? "text-success-500" : "text-error-500"
                      }`}
                    />
                    <span
                      className={`text-base font-medium ${
                        admin.is_active ? "text-success-700" : "text-error-700"
                      }`}
                    >
                      {admin.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                </div>
                <div>
                  <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                    {formatDate(admin.created_on)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Created On
                  </p>
                </div>
                <div>
                  <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                    {formatDate(admin.updated_on)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last Updated
                  </p>
                </div>
              </div>
            </div>

            {/* Functionalities Section */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                Assigned Functionalities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {admin.functionalities.map((functionality) => (
                  <div
                    key={functionality.id}
                    className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className="w-4 h-4 text-success-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {functionality.name
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </span>
                  </div>
                ))}
              </div>
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
