import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../hooks/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import DataTable from "../common/DataTable";
import Breadcrumb from "../Breadcrumb";
import DeleteConfirmModal from "../common/DeleteConfirmModal/DeleteConfirmModal";
import Modal from "../common/Modal";
import { API_CONFIG } from "../../config/appConfig";
import { toastController } from "../../utils/toastController";

function Features() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false); // <-- Add reload state
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [editFeatureName, setEditFeatureName] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingFeature, setDeletingFeature] = useState(null);
  const { BASE_URL, API_VERSION } = API_CONFIG;

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Features", path: "/features" },
  ];

  // Add core features list
  const CORE_FEATURES = [
    "user_app",
    "owner_app",
    "pos_app",
    "admin_app",
    "waiter_app",
    "captain_app",
    "cds_app",
    "kds_app",
  ];

  // Function to check if a feature is a core feature
  const isCoreFeature = (featureName) => CORE_FEATURES.includes(featureName);

  // Define columns for DataTable
  const columns = [
    {
      field: "feature_id",
      header: "ID",
      sortable: true,
      headerClassName: "text-center",
      render: (value) => (
        <div className="flex items-center justify-center">
          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
            {value}
          </span>
        </div>
      ),
    },
    {
      field: "name",
      header: "Name",
      sortable: true,
      headerClassName: "text-center",
      render: (value) => (
        <div className="flex items-center justify-center">
          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90 capitalize">
            {value.split("_").join(" ")}
          </span>
        </div>
      ),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      headerClassName: "text-center",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          {isCoreFeature(row.name) ? (
            <div className="text-xs text-gray-500 italic">
              Core System Feature
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditingFeature(row);
                  setEditFeatureName(row.name);
                  setIsEditModalOpen(true);
                }}
                className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
                title="Edit Feature"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setDeletingFeature(row);
                  setIsDeleteModalOpen(true);
                }}
                className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
                title="Delete Feature"
              >
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const handleCreateFeature = async () => {
    if (!newFeatureName.trim()) {
      toastController.error("Please enter a feature name");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/admin/create_feature`,
          {
            name: newFeatureName.toLowerCase().replace(/\s+/g, "_"),
            user_id: adminData.user_id,
            app_source: "admin_app",
          },
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        ),
        {
          loading: "Creating feature...",
          success: "Feature created successfully!",
          error: "Failed to create feature",
        }
      );

      // Reset form and close modal
      setNewFeatureName("");
      setIsModalOpen(false);

      // Refresh features list
      fetchFeatures();
    } catch (error) {
      console.error("Error creating feature:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchFeatures = async (isReload = false) => {
    try {
      if (isReload) {
        setIsReloading(true);
      } else {
        setIsLoading(true);
      }
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/admin/list_features`,
          {
            user_id: adminData.user_id,
            app_source: "admin_app",
          },
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        ),
        {
          loading: "Loading features...",
          success: "Features loaded successfully!",
          error: "Failed to load features",
        }
      );

      if (response.data.detail === "Feature list fetched successfully") {
        setFeatures(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching features:", error);
      toastController.error(
        error.response?.data?.detail || "Failed to fetch features"
      );
    } finally {
      if (isReload) {
        setIsReloading(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleEditFeature = async () => {
    if (!editFeatureName.trim() || !editingFeature) {
      toastController.error("Please enter a feature name");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      await toastController.promise(
        axios.put(
          `${BASE_URL}/${API_VERSION}/admin/update_feature`,
          {
            feature_id: editingFeature.feature_id,
            name: editFeatureName.toLowerCase().replace(/\s+/g, "_"),
            user_id: adminData.user_id,
            app_source: "admin_app",
          },
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        ),
        {
          loading: "Updating feature...",
          success: "Feature updated successfully!",
          error: "Failed to update feature",
        }
      );

      setIsEditModalOpen(false);
      setEditingFeature(null);
      setEditFeatureName("");
      fetchFeatures();
    } catch (error) {
      console.error("Error updating feature:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFeature = async () => {
    try {
      setIsSubmitting(true);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/admin/delete_feature`,
          {
            feature_id: deletingFeature.feature_id,
            user_id: adminData.user_id,
            app_source: "admin_app",
          },
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        ),
        {
          loading: "Deleting feature...",
          success: "Feature deleted successfully!",
          error: "Failed to delete feature",
        }
      );

      setIsDeleteModalOpen(false);
      setDeletingFeature(null);
      fetchFeatures();
    } catch (error) {
      console.error("Error deleting feature:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add reloadFetchFeatures function for DataTable reload
  const reloadFetchFeatures = async () => {
    await fetchFeatures(true); // pass true to indicate reload
  };

  useEffect(() => {
    if (adminData?.user_id) {
      fetchFeatures();
    }
  }, [adminData?.user_id]);

  // Remove the full-page spinner. Instead, show spinner only in DataTable reload button.

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      {/* Add warning message for core features */}
      <div className="mb-4 p-4 bg-warning-50 border border-warning-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-warning-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-warning-800">
              Core System Features
            </h3>
            <div className="mt-2 text-sm text-warning-700">
              <p>
                Core system features cannot be modified or deleted. These
                features are essential for the proper functioning of the system.
              </p>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        data={features}
        columns={columns}
        title="Features"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        counts={null}
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        searchPlaceholder="Search features"
        enableSort={true}
        enablePagination={false}
        enableSearch={true}
        enableStatusFilter={false}
        showSearch={true}
        itemsPerPage={50}
        showCreateButton={true}
        createButton={{
          show: true,
          label: "Create",
          icon: faPlus,
          onClick: () => setIsModalOpen(true),
          className: "bg-success-500 hover:bg-success-600",
          position: "right",
          showIconOnly: false,
          disabled: false,
          tooltip: "Create a new feature",
        }}
        onReload={reloadFetchFeatures}
        isLoading={isReloading} // pass reload state for spinner in reload button
      />

      {/* Create Feature Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewFeatureName("");
        }}
        title="Create New Feature"
        type="default"
        size="small"
      >
        <div className="w-full">
          <div className="mb-6">
            <label
              htmlFor="featureName"
              className="block text-xs sm:text-sm font-medium text-left text-gray-700 mb-2"
            >
              Feature Name <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              id="featureName"
              value={newFeatureName}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  CORE_FEATURES.includes(
                    value.toLowerCase().replace(/\s+/g, "_")
                  )
                ) {
                  toastController.error(
                    "This name is reserved for core system features"
                  );
                  return;
                }
                setNewFeatureName(value);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-success-500 focus:border-success-500 text-gray-900"
              placeholder="Enter feature name"
            />
            <p className="mt-2 text-xs text-gray-500">
              Note: Feature names that match core system features are not
              allowed.
            </p>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNewFeatureName("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
            <div>
              <button
                onClick={handleCreateFeature}
                disabled={!newFeatureName.trim() || isSubmitting}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-full transition-colors duration-200
                  ${
                    !newFeatureName.trim() || isSubmitting
                      ? "bg-success-500 cursor-not-allowed"
                      : "bg-success-500 hover:bg-success-600"
                  }`}
              >
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                {isSubmitting ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Feature Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingFeature(null);
          setEditFeatureName("");
        }}
        title="Edit Feature"
        type="default"
        size="small"
      >
        <div className="w-full">
          <div className="mb-6">
            <label
              htmlFor="editFeatureName"
              className="block text-xs sm:text-sm font-medium text-left text-gray-700 mb-2"
            >
              Feature Name <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              id="editFeatureName"
              value={editFeatureName}
              onChange={(e) => setEditFeatureName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-warning-500 focus:border-warning-500 text-gray-900"
              placeholder="Enter feature name"
            />
          </div>

          <div className="flex justify-end items-center gap-3">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingFeature(null);
                setEditFeatureName("");
              }}
              className="px-4 py-2 text-theme-sm font-medium text-gray-700 rounded-full border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEditFeature}
              disabled={!editFeatureName.trim() || isSubmitting}
              className={`inline-flex items-center gap-2 px-4 py-2 text-theme-sm font-medium text-white rounded-full transition-colors duration-200
                ${
                  !editFeatureName.trim() || isSubmitting
                    ? "bg-warning-500 cursor-not-allowed"
                    : "bg-warning-500 hover:bg-warning-600"
                }`}
            >
              <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Feature Modal using DeleteConfirmModal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingFeature(null);
        }}
        onDelete={handleDeleteFeature}
        title="Delete Feature"
        message={"Are you sure ?"}
      />
    </>
  );
}

export default Features;
