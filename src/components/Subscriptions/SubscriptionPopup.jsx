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

const SubscriptionPopup = ({ isOpen, onClose, onSave }) => {
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

  // Fetch modules on component mount
  useEffect(() => {
    if (isOpen) {
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
      setModules(response.data || []);
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
      setSelectedFeatures([]);
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
        name: `${selectedModule.name || "custom"}_auto_${Date.now()}`,
        price: 0,
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
        <div className="flex justify-end gap-3 w-full">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedModule}
            className="px-6 py-2 text-sm font-medium text-white bg-brand-500 rounded-full hover:bg-brand-600"
          >
            Save Configuration
          </button>
        </div>
      }
    >
      <div className="text-left max-h-[60vh] overflow-y-auto">
        {/* Step 1: Module Selection */}
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-800 mb-3">
            1. Select Module
          </h3>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading modules...</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {modules.map((module) => (
                <button
                  key={module.module_id}
                  onClick={() => handleModuleSelect(module)}
                  className={`px-3 py-2 border-2 rounded-lg text-left transition-all ${
                    selectedModule?.module_id === module.module_id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm capitalize">
                        {module.name}
                      </h4>
                      {module.description && (
                        <p className="text-xs text-gray-600 mt-1">
                          {module.description}
                        </p>
                      )}
                    </div>
                    {selectedModule?.module_id === module.module_id && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="w-4 h-4 text-blue-500"
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Feature Selection */}
        {selectedModule && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-gray-800">
                2. Select Features
              </h3>
              <button
                onClick={() => setShowFeatures(!showFeatures)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <span>{showFeatures ? "Hide" : "Show"}</span>
                <FontAwesomeIcon
                  icon={showFeatures ? faChevronUp : faChevronDown}
                  className="w-3 h-3"
                />
              </button>
            </div>

            {showFeatures && (
              <div className="border border-gray-200 rounded-lg p-3">
                {loadingFeatures ? (
                  <div className="text-center py-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-xs text-gray-600">
                      Loading features...
                    </p>
                  </div>
                ) : features.length > 0 ? (
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {features.map((feature) => (
                      <label
                        key={feature.feature_id}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFeatures.some(
                            (f) => f.feature_id === feature.feature_id
                          )}
                          onChange={() => handleFeatureToggle(feature)}
                          className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 text-sm capitalize">
                            {feature.name}
                          </h4>
                          {feature.description && (
                            <p className="text-xs text-gray-600">
                              {feature.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-3 text-sm">
                    No features available for this module
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Action Selection */}
        {selectedFeatures.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-gray-800">
                3. Select Actions
              </h3>
              <button
                onClick={() => setShowActions(!showActions)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <span>{showActions ? "Hide" : "Show"}</span>
                <FontAwesomeIcon
                  icon={showActions ? faChevronUp : faChevronDown}
                  className="w-3 h-3"
                />
              </button>
            </div>

            {showActions && (
              <div className="border border-gray-200 rounded-lg p-3">
                {loadingActions ? (
                  <div className="text-center py-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-xs text-gray-600">
                      Loading actions...
                    </p>
                  </div>
                ) : actions.length > 0 ? (
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {actions.map((action) => (
                      <label
                        key={action.action_id}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedActions.some(
                            (a) => a.action_id === action.action_id
                          )}
                          onChange={() => handleActionToggle(action)}
                          className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 text-sm capitalize">
                            {action.name}
                          </h4>
                          {action.description && (
                            <p className="text-xs text-gray-600">
                              {action.description}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-3 text-sm">
                    No actions available for selected features
                  </p>
                )}
              </div>
            )}
          </div>
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

        {/* Tenure / Start date selection (used to compute subscription end date) */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">
            Subscription tenure
          </h4>
          <div className="flex items-center gap-3">
            <select
              value={tenureMonths || ""}
              onChange={(e) =>
                setTenureMonths(e.target.value ? Number(e.target.value) : null)
              }
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
            >
              <option value="">Select months</option>
              {[1, 2, 3, 6, 8, 12, 24].map((m) => (
                <option key={m} value={m}>
                  {m} month{m > 1 ? "s" : ""}
                </option>
              ))}
            </select>

            <div>
              <label className="text-xs text-gray-600 block mb-1">
                Start date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SubscriptionPopup;
