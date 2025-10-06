import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import { API_CONFIG } from "../../../config/appConfig";
import { queryKeys } from "../../../lib/react-query/queryKeys";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faChevronLeft as faBack,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../../Breadcrumb";
import Modal from "../../common/Modal";
import DeleteConfirmModal from "../../common/DeleteConfirmModal/DeleteConfirmModal";

function RoleFunctionalitiesMapping() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [mappings, setMappings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [showEditModal, setShowEditModal] = useState(false);
  const [allFunctionalities, setAllFunctionalities] = useState([]);
  const [isLoadingFunctionalities, setIsLoadingFunctionalities] = useState(false);
  const [selectedFunctionalities, setSelectedFunctionalities] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { adminData } = useAdmin();

  // Add breadcrumb configuration
  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    // { label: "Access Control", path: "/home" },
    { label: "Roles", path: "/roles" },
    { label: "Role Functionalities", path: "#" },
  ];

  useEffect(() => {
    fetchRoleFunctionalityMappings();
  }, [roleId, fetchRoleFunctionalityMappings]);

  useEffect(() => {
    if (showEditModal) {
      // Use Set to ensure unique values
      const uniqueIds = [...new Set(mappings.map((m) => m.functionality_id))];
      setSelectedFunctionalities(uniqueIds);
      // Fetch all functionalities when modal opens
      fetchAllFunctionalities();
    }
  }, [showEditModal, mappings, fetchAllFunctionalities]);

  const fetchRoleFunctionalityMappings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        `${BASE_URL}/admin/listview_ubac_role_functionality_mapping`,
        { role_id: parseInt(roleId), app_source: "admin" },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      setMappings(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to fetch role functionality mappings"
      );
      console.error("Error fetching mappings:", err);
    } finally {
      setIsLoading(false);
    }
  }, [roleId, getToken, BASE_URL, API_VERSION]);

  const fetchAllFunctionalities = useCallback(async () => {
    try {
      setIsLoadingFunctionalities(true);
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.get(
        `${BASE_URL}/admin/get_ubac_functionalities`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      setAllFunctionalities(response.data);
    } catch (err) {
      console.error("Error fetching functionalities:", err);
    } finally {
      setIsLoadingFunctionalities(false);
    }
  }, [getToken, BASE_URL, API_VERSION]);

  const handleSaveChanges = async () => {
    // Validation: must select at least one functionality
    if (!selectedFunctionalities || selectedFunctionalities.length === 0) {
      setSaveError("Please choose functionality");
      return;
    }
    try {
      setIsSaving(true);
      setSaveError(null);

      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      await axios.post(
        `${BASE_URL}/admin/create_ubac_role_functionality_mapping`,
        {
          functionality_ids: selectedFunctionalities,
          role_id: parseInt(roleId), // Using roleId as user_id
          app_source: "admin",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      // Close modal and refresh the mappings
      setShowEditModal(false);
      fetchRoleFunctionalityMappings();
    } catch (err) {
      setSaveError(
        err.response?.data?.detail || "Failed to save functionalities"
      );
      console.error("Error saving functionalities:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFunctionalityToggle = (functionalityId) => {
    setSelectedFunctionalities((prev) => {
      const uniqueSet = new Set(prev);
      if (uniqueSet.has(functionalityId)) {
        uniqueSet.delete(functionalityId);
      } else {
        uniqueSet.add(functionalityId);
      }
      return Array.from(uniqueSet);
    });
  };

  const handleDeleteRoleMapping = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }
      await axios.post(
        `${BASE_URL}/admin/delete_ubac_role`,
        {
          role_id: parseInt(roleId),
          user_id: adminData.user_id,
          app_source: "admin_app",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      setIsDeleteModalOpen(false);
      // Invalidate roles cache to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      navigate("/roles");
    } catch (err) {
      console.error("Error deleting role:", err);
    } finally {
      // No loading state needed
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="">
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

            {/* Center - Title with Role Name */}
            <div className="flex-1 text-center text-lg sm:text-xl font-semibold text-gray-800">
              {mappings.length > 0 ? (
                <>
                  Role Functionalities:{" "}
                  <span className="capitalize text-brand-600">
                    {mappings[0].role_name}
                  </span>
                </>
              ) : (
                "Role Functionalities Mapping"
              )}
            </div>

            {/* Right Side - Edit */}
            <div className="flex items-center gap-4 order-3">
              <button
                onClick={() => {
                  navigate(`/edit-functionality/${roleId}`);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-warning-500 shadow-theme-xs hover:bg-warning-600"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                <span className="hidden sm:inline">Assign</span>
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-error-500 shadow-theme-xs hover:bg-error-600"
              >
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          {mappings.length > 0 && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {mappings.map((mapping) => (
                  <div
                    key={mapping.functionality_id}
                    className="p-4 border border-gray-200 rounded-lg flex items-center gap-3 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 line-clamp-2 flex items-center justify-between">
                        {mapping.functionality_name
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                        <span className="ml-2 text-black">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4 8.5L7 11.5L12 5.5"
                              stroke="black"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </p>
                      {/* <p className="text-sm text-gray-500 mt-0.5">
                        ID: {mapping.functionality_id}
                      </p> */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mappings.length === 0 && !error && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No functionalities mapped to this role.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={`Edit Functionalities : ${mappings[0]?.role_name || "Role"}`}
          size="large"
        >
          <div className="w-full">
            {isLoadingFunctionalities ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="text-error-600 text-red-500 mr-1">*</span>
                    Select Functionalities
                  </label>

                  <div className="relative">
                    {/* Functionalities List */}
                    <div
                      className="border rounded-lg"
                      style={{ maxHeight: "350px", overflowY: "auto" }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
                        {allFunctionalities.map((functionality) => (
                          <div
                            key={functionality.functionality_id}
                            className={`
                              p-3 cursor-pointer hover:bg-gray-50 border rounded-lg
                              ${
                                selectedFunctionalities.includes(
                                  functionality.functionality_id
                                )
                                  ? "bg-brand-50 border-brand-500"
                                  : "border-gray-200"
                              }
                            `}
                            onClick={() =>
                              handleFunctionalityToggle(
                                functionality.functionality_id
                              )
                            }
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedFunctionalities.includes(
                                  functionality.functionality_id
                                )}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleFunctionalityToggle(
                                    functionality.functionality_id
                                  );
                                }}
                                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                              />
                              <div>
                                <div className="font-medium text-gray-900 flex items-center justify-between">
                                  {functionality.functionality_name
                                    .split("_")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1)
                                    )
                                    .join(" ")}
                                  {selectedFunctionalities.includes(
                                    functionality.functionality_id
                                  ) && (
                                    <span className="ml-2 text-black">
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M4 8.5L7 11.5L12 5.5"
                                          stroke="black"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </span>
                                  )}
                                </div>
                                {/* <div className="text-sm text-gray-500">
                                  ID: {functionality.functionality_id}
                                </div> */}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  {saveError && (
                    <div className="flex-1 text-sm text-red-500">
                      {saveError}
                    </div>
                  )}
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteRoleMapping}
      />
    </div>
  );
}

export default RoleFunctionalitiesMapping;
