import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { queryKeys } from "../../lib/react-query/queryKeys";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft as faBack,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../hooks/useAuth";
import { useAdmin } from "../../hooks/useAdmin";
import {
  TextInput,
  SelectInput,
  DateInput,
  Checkbox,
  labelStyles,
} from "../forms/FormElements";
import Breadcrumb from "../Breadcrumb";
import { API_CONFIG } from "../../config/appConfig";
import { toastController } from "../../utils/toastController";

function CreateSubscription() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { adminData } = useAdmin();
  const queryClient = useQueryClient();
  const { BASE_URL, API_VERSION } = API_CONFIG;
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [features, setFeatures] = useState([]);
  const [actionsMap, setActionsMap] = useState({}); // feature_id => [actions]

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    tenure: "", // months (placeholder until selected)
    module_ids: [],
    feature_ids: [],
    action_ids: [],
  });

  const [validationStates, setValidationStates] = useState({
    name: false,
    price: false,
    tenure: false,
    module_ids: false,
    feature_ids: false,
  });

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Subscriptions", path: "/subscriptions" },
    { label: "Create Subscription" },
  ];

  // Fetch modules list
  const fetchModules = async () => {
    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const response = await axios.get(
        `${BASE_URL}/admin/modules`,
        {
          headers: { Authorization: token },
        }
      );

      if (Array.isArray(response.data)) {
        setModules(response.data);
        // Auto-select admin module if available
        const adminModuleId = adminData?.module_id;
        if (adminModuleId) {
          setFormData((prev) => ({ ...prev, module_ids: [adminModuleId] }));
          fetchFeatures(adminModuleId);
        }
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
      toastController.error("Failed to fetch modules");
    }
  };

  // Fetch features for a given module
  const fetchFeatures = async (moduleId) => {
    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const response = await axios.post(
        `${BASE_URL}/admin/list_features`,
        {
          user_id: adminData.user_id,
          app_source: "admin_app",
          module_id: moduleId,
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      const detail = response.data.detail;
      const incomingFeatures =
        response.data.data || response.data.features || response.data || [];

      if (
        Array.isArray(incomingFeatures) &&
        (detail === "Feature list fetched successfully" ||
          detail === "Features fetched successfully" ||
          incomingFeatures.length >= 0)
      ) {
        const normalized = incomingFeatures;
        setFeatures(normalized);
        // default select none; keep previous feature selection cleared
        setFormData((prev) => ({ ...prev, feature_ids: [], action_ids: [] }));
        setActionsMap({});
      }
    } catch (error) {
      console.error("Error fetching features:", error);
      toastController.error("Failed to fetch features");
    }
  };

  // Fetch and merge features for multiple modules
  const fetchFeaturesForModules = async (
    moduleIds,
    preserveSelection = false
  ) => {
    try {
      if (!Array.isArray(moduleIds) || moduleIds.length === 0) {
        setFeatures([]);
        return;
      }

      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const collected = [];
      for (const mid of moduleIds) {
        const response = await axios.post(
          `${BASE_URL}/admin/list_features`,
          {
            user_id: adminData.user_id,
            app_source: "admin_app",
            module_id: mid,
          },
          {
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        );
        const incoming =
          response.data.data || response.data.features || response.data || [];
        if (Array.isArray(incoming)) collected.push(...incoming);
      }

      // Deduplicate by feature_id
      const map = new Map();
      for (const f of collected) {
        const id = f.feature_id || f.id;
        if (id && !map.has(id)) map.set(id, f);
      }
      const merged = Array.from(map.values());
      setFeatures(merged);
      // reset selections related to features/actions unless caller asked to preserve
      if (!preserveSelection) {
        setFormData((prev) => ({ ...prev, feature_ids: [], action_ids: [] }));
        setActionsMap({});
      }
    } catch (error) {
      console.error("Error fetching features for modules:", error);
      toastController.error("Failed to fetch features");
    }
  };

  // Fetch actions for selected features
  const fetchActions = async (featureIds) => {
    try {
      if (!Array.isArray(featureIds) || featureIds.length === 0) {
        setActionsMap({});
        return;
      }
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      const response = await axios.post(
        `${BASE_URL}/admin/list_actions`,
        { feature_ids: featureIds },
        {
          headers: { Authorization: token, "Content-Type": "application/json" },
        }
      );

      const detail = response.data.detail;
      const payload = response.data.data ?? response.data;

      // Build map feature_id => actions for multiple possible shapes
      const map = {};
      if (Array.isArray(payload)) {
        // Case A: grouped by feature { feature_id, actions: [...] }
        const looksGrouped = payload.every((g) => Array.isArray(g?.actions));
        if (looksGrouped) {
          payload.forEach((group) => {
            const fid = group.feature_id || group.featureId || group.feature;
            map[fid] = Array.isArray(group.actions) ? group.actions : [];
          });
        } else {
          // Case B: flat list of actions with feature_id
          payload.forEach((a) => {
            const fid = a.feature_id || a.featureId || a.feature;
            if (!map[fid]) map[fid] = [];
            map[fid].push(a);
          });
        }
      }

      if (
        Object.keys(map).length > 0 ||
        detail === "Action list fetched successfully"
      ) {
        setActionsMap(map);
      }
    } catch (error) {
      console.error("Error fetching actions:", error);
      toastController.error("Failed to fetch actions");
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationStates((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  const handleFeatureChange = (featureId) => {
    setFormData((prev) => {
      const newFeatureIds = prev.feature_ids.includes(featureId)
        ? prev.feature_ids.filter((id) => id !== featureId)
        : [...prev.feature_ids, featureId];

      // After features change, clear any action selections that no longer apply
      const remainingActionIds = prev.action_ids.filter((aid) => {
        // keep only actions that belong to still selected features
        const actionBelongsToSelectedFeature = Object.values(actionsMap).some(
          (alist) =>
            alist.some(
              (a) => a.action_id === aid && newFeatureIds.includes(a.feature_id)
            )
        );
        return actionBelongsToSelectedFeature;
      });

      // Fetch actions for newly selected features
      fetchActions(newFeatureIds);

      return {
        ...prev,
        feature_ids: newFeatureIds,
        action_ids: remainingActionIds,
      };
    });
    setValidationStates((prev) => ({ ...prev, feature_ids: false }));
  };

  const handleActionChange = (actionId) => {
    setFormData((prev) => {
      const newActionIds = prev.action_ids.includes(actionId)
        ? prev.action_ids.filter((id) => id !== actionId)
        : [...prev.action_ids, actionId];

      return { ...prev, action_ids: newActionIds };
    });
  };

  const handleModuleToggle = (moduleId) => {
    setFormData((prev) => {
      const exists = prev.module_ids.includes(moduleId);
      const newModuleIds = exists
        ? prev.module_ids.filter((id) => id !== moduleId)
        : [...prev.module_ids, moduleId];

      // After module change, clear feature/action selections
      return {
        ...prev,
        module_ids: newModuleIds,
        feature_ids: [],
        action_ids: [],
      };
    });

    // Fetch features for updated module selection
    setTimeout(() => {
      const moduleIds = (formData.module_ids || []).includes(moduleId)
        ? formData.module_ids.filter((id) => id !== moduleId)
        : [...(formData.module_ids || []), moduleId];
      fetchFeaturesForModules(moduleIds);
    }, 0);

    setValidationStates((prev) => ({ ...prev, module_ids: false }));
  };

  const validateForm = () => {
    const newValidationStates = {
      name: !formData.name.trim(),
      price:
        !formData.price ||
        isNaN(formData.price) ||
        parseFloat(formData.price) <= 0,
      tenure:
        !formData.tenure || isNaN(formData.tenure) || formData.tenure <= 0,
      module_ids: formData.module_ids.length === 0,
      // subscription_end_date: !formData.subscription_end_date,
      feature_ids: formData.feature_ids.length === 0,
    };

    setValidationStates(newValidationStates);
    return !Object.values(newValidationStates).some((state) => state);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toastController.error("Please fill all required fields correctly");
      return;
    }

    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) throw new Error("No authentication token available");

      // Format tenure to a friendly string (e.g. "1 year" for 12 months)
      const formatTenure = (months) => {
        if (months % 12 === 0)
          return `${months / 12} year${months / 12 > 1 ? "s" : ""}`;
        return `${months} months`;
      };

      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description || "",
        tenure: formatTenure(formData.tenure),
        module_ids: formData.module_ids,
        feature_ids: formData.feature_ids,
        action_ids: formData.action_ids,
        user_id: adminData.user_id,
        app_source: "admin_app",
      };

      const response = await axios.post(
        `${BASE_URL}/admin/create_subscription`,
        payload,
        {
          headers: { Authorization: token, "Content-Type": "application/json" },
        }
      );

      if (response.data.detail === "Subscription created successfully") {
        toastController.success("Subscription created successfully");
        // Invalidate subscriptions cache to refresh the list
        queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
        navigate("/subscriptions");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      toastController.error(
        error.response?.data?.detail || "Failed to create subscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
            >
              <FontAwesomeIcon icon={faBack} className="w-4 h-4" />
              <span>Back</span>
            </button>

            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Create Subscription
            </h1>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`
                inline-flex items-center gap-2 px-4 py-2 
                text-sm font-medium text-white rounded-full
                bg-success-500 hover:bg-success-600 
                transition shadow-sm
                ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
              <span>{isLoading ? "Creating..." : "Create"}</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="">
          {/* Basic Information Section */}
          <section className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Basic Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-3 gap-3">
              <TextInput
                label="Plan Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                error={validationStates.name}
                errorMessage="Plan name is required"
                placeholder="Enter plan name"
              />

              <TextInput
                label="Price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                required
                error={validationStates.price}
                errorMessage="Please enter a valid price"
                placeholder="Enter price"
              />

              {/* Tenure (months) */}
              <div>
                <label className={labelStyles}>Tenure</label>
                <select
                  name="tenure"
                  value={formData.tenure}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tenure:
                        e.target.value === "" ? "" : Number(e.target.value),
                    }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="" disabled>
                    Select months
                  </option>
                  {[3, 6, 9, 12, 18, 24].map((m) => (
                    <option key={m} value={m}>
                      {m} {m === 1 ? "month" : "months"}
                    </option>
                  ))}
                </select>
                {validationStates.tenure && (
                  <p className="mt-1 text-xs text-error-500">
                    Please select tenure
                  </p>
                )}
              </div>

              {/* <DateInput
                label="End Date"
                name="subscription_end_date"
                value={formData.subscription_end_date}
                onChange={handleInputChange}
                required
                error={validationStates.subscription_end_date}
                placeholder="Select end date"
              /> */}
            </div>
          </section>

          {/* Modules Section */}
          <section className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 7l9-4 9 4-9 4-9-4zm0 6l9 4 9-4"
                />
              </svg>
              Modules <span className="text-error-600 ml-1">*</span>
            </h2>

            {modules.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No modules available.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {modules.map((mod) => {
                  const isSelected = formData.module_ids.includes(
                    mod.module_id
                  );
                  return (
                    <div
                      key={mod.module_id}
                      onClick={() => handleModuleToggle(mod.module_id)}
                      className={`
                        bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border cursor-pointer select-none
                        ${
                          isSelected
                            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-brand-500/50 dark:hover:border-brand-500/50"
                        }
                        transition-all duration-200 ease-in-out
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleModuleToggle(mod.module_id)}
                            onClick={(e) => e.stopPropagation()}
                            className="form-checkbox h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 cursor-pointer"
                          />
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {mod.name.split("_").join(" ").toUpperCase()}
                          </span>
                        </label>
                      </div>
                      {mod.description && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {mod.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {validationStates.module_ids && (
              <p className="mt-2 text-sm text-error-500">
                Please select a module
              </p>
            )}
          </section>

          {/* Features Section */}
          <section className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white/90 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                Features
                <span className="text-error-600 ml-1">*</span>
              </h2>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      features.length > 0 &&
                      formData.feature_ids.length === features.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        const allIds = features.map((f) => f.feature_id);
                        setFormData((prev) => ({
                          ...prev,
                          feature_ids: allIds,
                          action_ids: [],
                        }));
                        // Fetch actions for all selected features
                        fetchActions(allIds);
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          feature_ids: [],
                          action_ids: [],
                        }));
                        // Clear actions when none selected
                        setActionsMap({});
                      }
                    }}
                  />
                  Check All
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Selected: {formData.feature_ids.length}
                </span>
              </div>
            </div>

            <div
              className={`
              grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4
            `}
            >
              {features.map((feature) => {
                const isSelected = formData.feature_ids.includes(
                  feature.feature_id
                );

                return (
                  <div
                    key={feature.feature_id}
                    onClick={() => handleFeatureChange(feature.feature_id)}
                    className={`
        bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm 
        border cursor-pointer select-none
        ${
          isSelected
            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/10"
            : "border-gray-200 dark:border-gray-700 hover:border-brand-500/50 dark:hover:border-brand-500/50"
        }
        transition-all duration-200 ease-in-out
      `}
                  >
                    <label className="flex items-center space-x-3 w-full cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onClick={(e) => e.stopPropagation()} // 👈 prevent card click conflict
                        onChange={() => handleFeatureChange(feature.feature_id)}
                        className="form-checkbox h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 cursor-pointer"
                      />
                      <span
                        className={`
            text-sm font-medium pl-2
            ${
              isSelected
                ? "text-brand-700 dark:text-brand-400"
                : "text-gray-700 dark:text-gray-300"
            }
          `}
                      >
                        {feature.name.split("_").join(" ").toUpperCase()}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
            {validationStates.feature_ids && (
              <p className="mt-2 text-sm text-error-500">
                Please select at least one feature
              </p>
            )}
          </section>

          {/* Actions Section */}
          {formData.feature_ids.length > 0 && (
            <section className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
              {(() => {
                const combinedActions = formData.feature_ids.flatMap(
                  (fid) => actionsMap[fid] || []
                );
                const allActionIds = Array.from(
                  new Set(combinedActions.map((a) => a.action_id))
                );
                const allChecked =
                  allActionIds.length > 0 &&
                  allActionIds.every((id) => formData.action_ids.includes(id));

                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium text-gray-800 dark:text-white/90 flex items-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6M5 8h14M7 4h10"
                          />
                        </svg>
                        Actions
                      </h2>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  action_ids: allActionIds,
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  action_ids: [],
                                }));
                              }
                            }}
                          />
                          Check All
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Selected: {formData.action_ids.length}
                        </span>
                      </div>
                    </div>

                    {combinedActions.length === 0 ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        No actions found.
                      </p>
                    ) : (
                      <div
                        className={`
              grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4
            `}
                      >
                        {combinedActions.map((act) => {
                          const selected = formData.action_ids.includes(
                            act.action_id
                          );
                          const actionLabel = (
                            act.name ||
                            act.action_name ||
                            `Action ${act.action_id}`
                          )
                            .split("_")
                            .join(" ")
                            .toUpperCase();
                          return (
                            <div
                              key={act.action_id}
                              onClick={() => handleActionChange(act.action_id)}
                              className={`
                            bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border cursor-pointer select-none
                            ${
                              selected
                                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/10"
                                : "border-gray-200 dark:border-gray-700 hover:border-brand-500/50 dark:hover:border-brand-500/50"
                            }
                            transition-all duration-200 ease-in-out
                          `}
                            >
                              <label className="flex items-center space-x-3 w-full cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={() =>
                                    handleActionChange(act.action_id)
                                  }
                                  className="form-checkbox h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 cursor-pointer"
                                />
                                <span
                                  className={`text-sm font-medium pl-2 whitespace-normal break-words ${
                                    selected
                                      ? "text-brand-700 dark:text-brand-400"
                                      : "text-gray-700 dark:text-gray-300"
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
        </form>
      </div>
    </>
  );
}

export default CreateSubscription;
