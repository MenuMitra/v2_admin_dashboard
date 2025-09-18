import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import { API_CONFIG } from "../../config/appConfig";
import { toastController } from "../../utils/toastController";
import Modal from "../common/Modal";

const { BASE_URL, API_VERSION } = API_CONFIG;

const SubscriptionPopup = ({
  isOpen,
  onClose,
  onSave,
  initialModuleId,
  initialFeatureIds,
  initialActionIds,
  initialPlanName,
  initialPrice,
  initialTenureMonths,
  primaryButtonLabel,
}) => {
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const [modules, setModules] = useState([]);
  const [features, setFeatures] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Selected items
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedActions, setSelectedActions] = useState([]);

  // UI states
  const [showFeatures, setShowFeatures] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [loadingActions, setLoadingActions] = useState(false);
  const [tenureMonths, setTenureMonths] = useState(null);
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");

  // Derived validation flags
  const isNameValid = (planName || "").trim().length > 0;
  const isPriceValid =
    planPrice !== "" && !isNaN(Number(planPrice)) && Number(planPrice) > 0;
  const isTenureValid = !!tenureMonths;
  const isModuleSelected = !!selectedModule;
  const canAssign =
    isNameValid && isPriceValid && isTenureValid && isModuleSelected;

  // Fetch modules on open and seed basic fields
  useEffect(() => {
    if (isOpen) {
      // seed basic inputs
      if (typeof initialPlanName === "string") setPlanName(initialPlanName);
      if (
        initialPrice !== undefined &&
        initialPrice !== null &&
        !isNaN(Number(initialPrice))
      )
        setPlanPrice(String(initialPrice));
      if (
        initialTenureMonths !== undefined &&
        initialTenureMonths !== null &&
        !isNaN(Number(initialTenureMonths))
      )
        setTenureMonths(Number(initialTenureMonths));

      fetchModules();
    }
  }, [isOpen]);

  // Fetch features when module is selected
  useEffect(() => {
    if (selectedModule) {
      fetchFeatures(selectedModule.module_id);
    }
  }, [selectedModule]);

  // Fetch actions when features are selected
  useEffect(() => {
    if (selectedFeatures.length > 0) {
      fetchActions(selectedFeatures.map((f) => f.feature_id));
    } else {
      setActions([]);
      setShowActions(false);
    }
  }, [selectedFeatures]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(
        `${BASE_URL}/${API_VERSION}/admin/modules`,
        {
          headers: { Authorization: token },
        }
      );
      const list = response.data || [];
      setModules(list);
      // Preselect module if provided
      if (initialModuleId) {
        const match = list.find((m) => m.module_id === initialModuleId);
        if (match) setSelectedModule(match);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      toastController.error("Failed to fetch modules");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatures = async (moduleId) => {
    try {
      setLoadingFeatures(true);
      const token = getToken();
      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/list_features`,
        { module_id: moduleId },
        { headers: { Authorization: token } }
      );
      const list = response.data?.features || response.data?.data || [];
      setFeatures(list);
      // Preselect features if provided
      if (Array.isArray(initialFeatureIds) && initialFeatureIds.length > 0) {
        const preset = list.filter((f) =>
          initialFeatureIds.includes(f.feature_id)
        );
        setSelectedFeatures(preset);
      } else {
        setSelectedFeatures([]);
      }
      setActions([]);
      setShowFeatures(true);
    } catch (error) {
      console.error("Error fetching features:", error);
      toastController.error("Failed to fetch features");
    } finally {
      setLoadingFeatures(false);
    }
  };

  const fetchActions = async (featureIds) => {
    try {
      setLoadingActions(true);
      const token = getToken();

      // Prefer sending a single request with feature_ids array to the API
      const payload = {
        feature_ids: Array.isArray(featureIds) ? featureIds : [featureIds],
      };

      const response = await axios.post(
        `${BASE_URL}/${API_VERSION}/admin/list_actions`,
        payload,
        { headers: { Authorization: token } }
      );

      // API may return actions directly or nested under data[] with actions arrays
      let list = response.data?.actions || response.data?.data || [];

      // If data is an array of { actions: [...] }, flatten them
      if (Array.isArray(list) && list.length > 0 && list[0].actions) {
        const flattened = [];
        for (const entry of list) {
          if (Array.isArray(entry.actions)) flattened.push(...entry.actions);
        }
        list = flattened;
      }

      const uniqueActions = Array.isArray(list)
        ? list.filter(
            (action, index, self) =>
              index === self.findIndex((a) => a.action_id === action.action_id)
          )
        : [];

      setActions(uniqueActions);
      // Preselect actions if provided
      if (Array.isArray(initialActionIds) && initialActionIds.length > 0) {
        const preset = uniqueActions.filter((a) =>
          initialActionIds.includes(a.action_id)
        );
        setSelectedActions(preset);
      }
      setShowActions(true);
    } catch (error) {
      console.error("Error fetching actions:", error);
      toastController.error("Failed to fetch actions");
    } finally {
      setLoadingActions(false);
    }
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setSelectedFeatures([]);
    setSelectedActions([]);
    setFeatures([]);
    setActions([]);
    setShowFeatures(false);
    setShowActions(false);
  };

  const handleFeatureToggle = (feature) => {
    setSelectedFeatures((prev) => {
      const isSelected = prev.some((f) => f.feature_id === feature.feature_id);
      if (isSelected) {
        return prev.filter((f) => f.feature_id !== feature.feature_id);
      } else {
        return [...prev, feature];
      }
    });
  };

  const handleActionToggle = (action) => {
    setSelectedActions((prev) => {
      const isSelected = prev.some((a) => a.action_id === action.action_id);
      if (isSelected) {
        return prev.filter((a) => a.action_id !== action.action_id);
      } else {
        return [...prev, action];
      }
    });
  };

  const handleSave = async () => {
    if (!selectedModule) {
      toastController.error("Please select a module");
      return;
    }

    const subscriptionData = {
      module: selectedModule,
      features: selectedFeatures,
      actions: selectedActions,
    };

    // Create a subscription on the server so we can attach its id to the outlet
    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      // Human-friendly tenure string (e.g. "1 month", "1 year")
      const tenureString = tenureMonths
        ? tenureMonths >= 12 && tenureMonths % 12 === 0
          ? `${tenureMonths / 12} year${tenureMonths / 12 > 1 ? "s" : ""}`
          : `${tenureMonths} month${tenureMonths > 1 ? "s" : ""}`
        : null;

      const createPayload = {
        name:
          (planName && planName.trim()) ||
          `${selectedModule.name || "custom"}_auto_${Date.now()}`,
        price:
          planPrice !== "" && !isNaN(Number(planPrice)) ? Number(planPrice) : 0,
        // Keep feature_ids for backward compatibility
        feature_ids: selectedFeatures
          .map((f) => f.feature_id || f.id)
          .filter(Boolean),
        // Also send module ids (API expects module_ids per your example)
        module_ids: selectedModule ? [selectedModule.module_id] : [],
        user_id: adminData?.user_id,
        app_source: "admin_app",
        tenure_months: tenureMonths || null,
        tenure: tenureString,
        start_date: startDate || null,
      };

      const response = await toastController.promise(
        axios.post(
          `${BASE_URL}/${API_VERSION}/admin/create_subscription`,
          createPayload,
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        ),
        {
          loading: "Saving subscription...",
          success: "Subscription created successfully",
          error: "Failed to create subscription",
        }
      );

      // Try to extract created subscription id from common response shapes
      const createdId =
        response?.data?.data?.subscription_id ||
        response?.data?.subscription_id ||
        response?.data?.data?.id ||
        response?.data?.id ||
        null;

      // Compute returned subscription object to pass back to parent along with computed end date
      const createdSubscription =
        response?.data?.data || response?.data || null;

      // Calculate end date if tenure provided
      let endDate = null;
      if (tenureMonths && startDate) {
        const start = new Date(startDate);
        const result = new Date(start);
        result.setMonth(result.getMonth() + Number(tenureMonths));
        // Subtract one day to make end date inclusive of last month
        result.setDate(result.getDate() - 1);
        endDate = result.toISOString().split("T")[0];
      }

      // If server didn't return tenure/start/end, augment the returned object so UI can display it
      if (createdSubscription) {
        if (
          (createdSubscription.tenure === null ||
            createdSubscription.tenure === undefined) &&
          tenureMonths
        ) {
          createdSubscription.tenure = tenureMonths;
        }
        if (!createdSubscription.start_date && startDate) {
          createdSubscription.start_date = startDate;
        }
        if (!createdSubscription.subscription_end_date && endDate) {
          createdSubscription.subscription_end_date = endDate;
        }
      }

      // If the server didn't return an id, still try to pass back the raw response (augmented)
      if (!createdId) {
        toastController.error(
          "Subscription created but server did not return an id"
        );
        onSave({
          ...subscriptionData,
          subscription: createdSubscription,
          subscription_start_date: startDate || null,
          subscription_end_date: endDate,
        });
      } else {
        onSave({
          ...subscriptionData,
          subscription_id: createdId,
          subscription: createdSubscription,
          subscription_start_date: startDate || null,
          subscription_end_date: endDate,
        });
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      toastController.error(
        error.response?.data?.detail || "Failed to create subscription"
      );
    } finally {
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedModule(null);
    setSelectedFeatures([]);
    setSelectedActions([]);
    setFeatures([]);
    setActions([]);
    setShowFeatures(false);
    setShowActions(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Configure Subscription"
      size="large"
      actionButtons={
        <div className="flex justify-between items-center w-full">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canAssign}
            className={`px-6 py-2 text-sm font-medium text-white bg-brand-500 rounded-full hover:bg-brand-600 ${
              canAssign ? "" : "opacity-50 cursor-not-allowed"
            }`}
          >
            {primaryButtonLabel || "Assign Subscription"}
          </button>
        </div>
      }
    >
      <div className="text-left max-h-[60vh] overflow-y-auto">
        {/* Basic Information Row */}
        <section className="bg-white p-4 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600 block mb-1">
                Plan Name <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Enter plan name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">
                Price <span className="text-error-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={planPrice}
                onChange={(e) => setPlanPrice(e.target.value)}
                placeholder="Enter price"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">
                Tenure (months) <span className="text-error-500">*</span>
              </label>
              <select
                value={tenureMonths || ""}
                onChange={(e) =>
                  setTenureMonths(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
              >
                <option value="">Select months</option>
                {[1, 2, 3, 6, 9, 12, 24].map((m) => (
                  <option key={m} value={m}>
                    {m} month{m > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
        {/* Modules Section */}
        <section className="bg-white p-4 rounded-lg">
          <h2 className="text-base font-medium text-gray-800 mb-3 flex items-center">
            Modules
          </h2>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading modules...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {modules.map((mod) => {
                const isSelected = selectedModule?.module_id === mod.module_id;
                return (
                  <div
                    key={mod.module_id}
                    onClick={() => handleModuleSelect(mod)}
                    className={`
                      bg-white rounded-lg p-3 shadow-sm border cursor-pointer select-none
                      ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }
                      transition-all duration-200 ease-in-out
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800 capitalize">
                        {mod.name?.split("_").join(" ")}
                      </span>
                      <input type="radio" checked={isSelected} readOnly />
                    </div>
                    {mod.description && (
                      <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                        {mod.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Features Section */}
        {selectedModule && (
          <section className="bg-white p-4 rounded-lg mt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-medium text-gray-800 flex items-center">
                Features <span className="text-red-500 ml-1">*</span>
              </h2>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      features.length > 0 &&
                      selectedFeatures.length === features.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFeatures(features);
                      } else {
                        setSelectedFeatures([]);
                        setSelectedActions([]);
                      }
                    }}
                  />
                  Check All
                </label>
                <span className="text-xs text-gray-500">
                  Selected: {selectedFeatures.length}
                </span>
              </div>
            </div>

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3`}
            >
              {loadingFeatures ? (
                <div className="text-center py-3 col-span-full">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-xs text-gray-600">
                    Loading features...
                  </p>
                </div>
              ) : features.length === 0 ? (
                <p className="text-gray-500 text-center py-3 text-sm col-span-full">
                  No features available for this module
                </p>
              ) : (
                features.map((feature) => {
                  const isSelected = selectedFeatures.some(
                    (f) => f.feature_id === feature.feature_id
                  );
                  return (
                    <div
                      key={feature.feature_id}
                      onClick={() => handleFeatureToggle(feature)}
                      className={`
                        bg-white rounded-lg p-3 shadow-sm border cursor-pointer select-none
                        ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }
                        transition-all duration-200 ease-in-out
                      `}
                    >
                      <label className="flex items-center space-x-3 w-full cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleFeatureToggle(feature)}
                          className="form-checkbox h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span
                          className={`text-sm font-medium pl-2 capitalize ${
                            isSelected ? "text-blue-700" : "text-gray-700"
                          }`}
                        >
                          {feature.name?.split("_").join(" ")}
                        </span>
                      </label>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* Actions Section */}
        {selectedFeatures.length > 0 && (
          <section className="bg-white p-4 rounded-lg mt-4">
            {(() => {
              const allActionIds = actions.map((a) => a.action_id);
              const selectedActionIds = selectedActions.map((a) => a.action_id);
              const allChecked =
                allActionIds.length > 0 &&
                allActionIds.every((id) => selectedActionIds.includes(id));

              return (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-medium text-gray-800 flex items-center">
                      Actions
                    </h2>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedActions(actions);
                            } else {
                              setSelectedActions([]);
                            }
                          }}
                        />
                        Check All
                      </label>
                      <span className="text-xs text-gray-500">
                        Selected: {selectedActions.length}
                      </span>
                    </div>
                  </div>

                  {loadingActions ? (
                    <div className="text-center py-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-xs text-gray-600">
                        Loading actions...
                      </p>
                    </div>
                  ) : actions.length === 0 ? (
                    <p className="text-gray-500 text-center py-3 text-sm">
                      No actions available for selected features
                    </p>
                  ) : (
                    <div
                      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3`}
                    >
                      {actions.map((action) => {
                        const selected = selectedActions.some(
                          (a) => a.action_id === action.action_id
                        );
                        const actionLabel = (
                          action.name ||
                          action.action_name ||
                          `Action ${action.action_id}`
                        )
                          .split("_")
                          .join(" ")
                          .toUpperCase();
                        return (
                          <div
                            key={action.action_id}
                            onClick={() => handleActionToggle(action)}
                            className={`
                              bg-white rounded-lg p-3 shadow-sm border cursor-pointer select-none
                              ${
                                selected
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-blue-300"
                              }
                              transition-all duration-200 ease-in-out
                            `}
                          >
                            <label className="flex items-center space-x-3 w-full cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selected}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => handleActionToggle(action)}
                                className="form-checkbox h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span
                                className={`text-sm font-medium pl-2 whitespace-normal break-words ${
                                  selected ? "text-blue-700" : "text-gray-700"
                                }`}
                              >
                                {actionLabel}
                              </span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </section>
        )}

        {/* Summary */}
        {(selectedModule ||
          selectedFeatures.length > 0 ||
          selectedActions.length > 0) && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="text-sm font-medium text-gray-800 mb-2">
              Selection Summary
            </h3>
            <div className="space-y-1">
              {selectedModule && (
                <p className="text-xs">
                  <span className="font-medium">Module:</span>{" "}
                  {selectedModule.name}
                </p>
              )}
              {selectedFeatures.length > 0 && (
                <p className="text-xs">
                  <span className="font-medium">Features:</span>{" "}
                  {selectedFeatures.length} selected
                </p>
              )}
              {selectedActions.length > 0 && (
                <p className="text-xs">
                  <span className="font-medium">Actions:</span>{" "}
                  {selectedActions.length} selected
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SubscriptionPopup;
