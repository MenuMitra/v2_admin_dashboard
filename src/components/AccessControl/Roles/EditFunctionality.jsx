import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faCheck,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { toastController } from "../../../utils/toastController";
import { API_CONFIG } from "../../../config/appConfig";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import Breadcrumb from "../../Breadcrumb";

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

function EditFunctionality() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [roleName, setRoleName] = useState("");
  const [allFunctionalities, setAllFunctionalities] = useState([]);
  const [selectedFunctionalities, setSelectedFunctionalities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Roles", path: "/roles" },
    { label: "Edit Functionalities" },
  ];

  useEffect(() => {
    fetchAllFunctionalities();
    fetchRoleFunctionalities();
  }, [roleId]);

  const fetchAllFunctionalities = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");
      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/admin/get_ubac_functionalities`,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      // Ensure we have an array of functionalities
      let functionalities = [];
      if (response.data) {
        // Check if data is directly an array
        if (Array.isArray(response.data)) {
          functionalities = response.data;
        }
        // Check if data is nested in a data property
        else if (response.data.data && Array.isArray(response.data.data)) {
          functionalities = response.data.data;
        }
        // Check if data is nested in a functionalities property
        else if (
          response.data.functionalities &&
          Array.isArray(response.data.functionalities)
        ) {
          functionalities = response.data.functionalities;
        }
        // If none of the above, try to convert to array if possible
        else if (typeof response.data === "object") {
          functionalities = Object.values(response.data);
        }
      }

      console.log("API Response:", response.data);
      console.log("Processed functionalities:", functionalities);

      setAllFunctionalities(functionalities);
    } catch (err) {
      console.error("Error fetching functionalities:", err);
      setSaveError("Failed to load functionalities");
      setAllFunctionalities([]); // Ensure it's an empty array on error
    }
  };

  const fetchRoleFunctionalities = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/listview_ubac_role_functionality_mapping`,
        { role_id: parseInt(roleId), app_source: "admin" },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      setRoleName(response.data[0]?.role_name || "Role");
      // Use Set to ensure unique values
      const uniqueIds = [
        ...new Set(response.data.map((m) => m.functionality_id)),
      ];
      setSelectedFunctionalities(uniqueIds);
    } catch (err) {
      setSaveError("Failed to load role functionalities");
    } finally {
      setIsLoading(false);
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

  const handleSaveChanges = async () => {
    if (!selectedFunctionalities || selectedFunctionalities.length === 0) {
      setSaveError("Please choose functionality");
      return;
    }
    setIsSaving(true);
    setSaveError("");
    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");
      await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/create_ubac_role_functionality_mapping`,
        {
          functionality_ids: selectedFunctionalities,
          role_id: parseInt(roleId),
          app_source: "admin",
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );
      toastController.success("Functionalities updated successfully");
      navigate(-1);
    } catch (err) {
      setSaveError(
        err.response?.data?.detail || "Failed to save functionalities"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    toastController.warning("Delete functionality not implemented");
  };

  return (
    <>
      {/* Breadcrumb at the top */}
      <div className="mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6 mt-6">
        <div className="relative flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
          >
            <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h2 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-semibold text-gray-800 dark:text-white/90 text-center">
            Edit Functionalities : {toTitleCase(roleName)}
          </h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  <span className="text-error-600 text-red-500 mr-1">*</span>
                  Select Functionalities
                </label>
                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      allFunctionalities.length > 0 &&
                      selectedFunctionalities.length ===
                        allFunctionalities.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        const allIds = allFunctionalities.map(
                          (f) => f.functionality_id
                        );
                        setSelectedFunctionalities(allIds);
                      } else {
                        setSelectedFunctionalities([]);
                      }
                    }}
                  />
                  Check All
                </label>
              </div>
              <div className="relative">
                <div
                  className="border rounded-lg"
                  style={{ maxHeight: "350px", overflowY: "auto" }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
                    {Array.isArray(allFunctionalities) &&
                      allFunctionalities.map((functionality) => (
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
                              <div className="font-medium text-gray-900">
                                {functionality.functionality_name
                                  ?.split("_")
                                  ?.map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  )
                                  ?.join(" ") ||
                                  functionality.functionality_name ||
                                  "Unknown"}
                              </div>
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
                <div className="flex-1 text-sm text-red-500">{saveError}</div>
              )}
              <button
                onClick={() => navigate(-1)}
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
    </>
  );
}

export default EditFunctionality;
