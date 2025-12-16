import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

function EditSubscription() {
  const navigate = useNavigate();
  const { subscriptionId } = useParams();
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
    tenure: 12,
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
    { label: "Edit Subscription" },
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
      }
    } catch (error) {
      
      toastController.error("Failed to fetch modules");
    }
  };

  // Fetch subscription details
  const fetchSubscriptionDetails = async () => {
    try {
      const response = await toastController.promise(
        axios.post(
          `${BASE_URL}/admin/view_subscription`,
          {
            subscription_id: Number(subscriptionId),
            user_id: adminData.user_id,
            app_source: "admin_app",
          },
          {
            headers: {
              Authorization: getToken(),
            },
          }
        ),
        {
          loading: "Loading subscription details...",
          success: "Subscription details loaded successfully!",
          error: "Failed to load subscription details",
        }
      );

      if (response.data.detail === "Subscription fetched successfully") {
        const subscription = response.data.data || {};

        // API may return modules/features/actions nested under `modules`.
        // Extract ids from nested structure when top-level arrays are missing.
        const modulesFromPayload = Array.isArray(subscription.modules)
          ? subscription.modules
          : [];

        const moduleIdsFromModules = modulesFromPayload.map((m) =>
          Number(m.module_id)
        );

        const featureIdsFromModules = modulesFromPayload.flatMap((m) =>
          Array.isArray(m.features)
            ? m.features.map((f) => Number(f.feature_id))
            : []
        );

        const actionIdsFromModules = modulesFromPayload.flatMap((m) =>
          Array.isArray(m.features)
            ? m.features.flatMap((f) =>
                Array.isArray(f.actions)
                  ? f.actions.map((a) => Number(a.action_id))
                  : []
              )
            : []
        );

        const existingModuleIdsRaw =
          subscription.module_ids ||
          (subscription.module_id
            ? [subscription.module_id]
            : moduleIdsFromModules || []);

        // Normalize module ids to numbers to avoid string/number mismatches
        const existingModuleIds = Array.isArray(existingModuleIdsRaw)
          ? existingModuleIdsRaw.map((id) => Number(id))
          : [];

        const existingFeatureIdsRaw =
          subscription.feature_ids || featureIdsFromModules || [];
        const existingFeatureIds = Array.isArray(existingFeatureIdsRaw)
          ? existingFeatureIdsRaw.map((id) => Number(id))
          : [];

        const existingActionIdsRaw =
          subscription.action_ids || actionIdsFromModules || [];
        const existingActionIds = Array.isArray(existingActionIdsRaw)
          ? existingActionIdsRaw.map((id) => Number(id))
          : [];
        // Normalize tenure if string like "1 year"
        const parseTenureToMonths = (tenure) => {
          if (!tenure) return 12;
          if (typeof tenure === "number") return tenure;
          const lowered = String(tenure).toLowerCase();
          const matchYears = lowered.match(/(\d+)\s*year/);
          if (matchYears) return Number(matchYears[1]) * 12;
          const matchMonths = lowered.match(/(\d+)\s*month/);
          if (matchMonths) return Number(matchMonths[1]);
          return 12;
        };

        setFormData((prev) => ({
          ...prev,
          name: subscription.name || "",
          price: subscription.price ?? "",
          tenure: parseTenureToMonths(subscription.tenure) ?? 12,
          module_ids: existingModuleIds,
          feature_ids: existingFeatureIds,
          action_ids: existingActionIds,
        }));

        // Pre-check modules in the UI by ensuring modules state contains them
        if (Array.isArray(existingModuleIds) && existingModuleIds.length > 0) {
          // If modules already fetched, keep; otherwise fetch modules to populate names
          if (!modules || modules.length === 0) {
            await fetchModules();
          }
          // Ensure any module ids present are numbers to match mod.module_id
          setFormData((prev) => ({ ...prev, module_ids: existingModuleIds }));
        }

        // If module present, load merged features for those modules and preselect existing features/actions
        if (existingModuleIds.length > 0) {
          await fetchFeaturesForModules(existingModuleIds, true);
        }
        if (existingFeatureIds.length > 0) {
          // Ensure selectedFeatures objects are set so UI checkboxes show correctly
          const presetFeatures = (
            response?.data?.data?.features ||
            response?.data?.features ||
            []
          ).filter((f) => existingFeatureIds.includes(f.feature_id));
          setFeatures((prev) => {
            // merge any fetched features with preset if missing
            const map = new Map(prev.map((f) => [f.feature_id || f.id, f]));
            presetFeatures.forEach((f) => {
              const id = f.feature_id || f.id;
              if (id && !map.has(id)) map.set(id, f);
            });
            return Array.from(map.values());
          });
          setFormData((prev) => ({ ...prev, feature_ids: existingFeatureIds }));
          if (existingActionIds.length > 0)
            await fetchActions(existingFeatureIds);
        }
      }
    } catch (error) {
      
      toastController.error(
        error.response?.data?.detail || "Failed to fetch subscription details"
      );
      navigate("/subscriptions");
    }
  };

  // Fetch available features for a module
  const fetchFeatures = async (moduleId) => {
    try {
      const response = await toastController.promise(
        axios.post(
          `${BASE_URL}/admin/list_features`,
          {
            user_id: adminData.user_id,
            app_source: "admin_app",
            module_id: moduleId,
          },
          {
            headers: {
              Authorization: getToken(),
            },
          }
        ),
        {
          loading: "Loading features...",
          success: "Features loaded successfully!",
          error: "Failed to load features",
        }
      );

      if (
        response.data.detail === "Feature list fetched successfully" ||
        response.data.detail === "Features fetched successfully" ||
        Array.isArray(response.data.data) ||
        Array.isArray(response.data.features)
      ) {
        const incoming =
          response.data.data || response.data.features || response.data || [];
        setFeatures(incoming);
        // If currently selected feature_ids are not in this module, clear them
        setFormData((prev) => ({
          ...prev,
          feature_ids: (prev.feature_ids || []).filter((fid) =>
            incoming.some((f) => f.feature_id === fid)
          ),
          action_ids: [],
        }));
        setActionsMap({});
      }
    } catch (error) {
      
      toastController.error(
        error.response?.data?.detail || "Failed to fetch features"
      );
    }
  };

  // Fetch and merge features for multiple modules (reuse logic from CreateSubscription)
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
          { headers: { Authorization: token } }
        );
        const incoming =
          response.data.data || response.data.features || response.data || [];
        if (Array.isArray(incoming)) collected.push(...incoming);
      }

      const map = new Map();
      for (const f of collected) {
        const id = f.feature_id || f.id;
        if (id && !map.has(id)) map.set(id, f);
      }
      setFeatures(Array.from(map.values()));
      // Only clear previously selected feature/action ids when caller doesn't want to preserve them
      if (!preserveSelection) {
        setFormData((prev) => ({ ...prev, feature_ids: [], action_ids: [] }));
        setActionsMap({});
      }
    } catch (error) {
     
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
      const response = await axios.post(
        `${BASE_URL}/admin/list_actions`,
        { feature_ids: featureIds },
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      const payload = response.data.data ?? response.data;
      const map = {};
      if (Array.isArray(payload)) {
        const looksGrouped = payload.every((g) => Array.isArray(g?.actions));
        if (looksGrouped) {
          payload.forEach((group) => {
            const fid = group.feature_id || group.featureId || group.feature;
            map[fid] = Array.isArray(group.actions) ? group.actions : [];
          });
        } else {
          payload.forEach((a) => {
            const fid = a.feature_id || a.featureId || a.feature;
            if (!map[fid]) map[fid] = [];
            map[fid].push(a);
          });
        }
      }
      setActionsMap(map);
    } catch (error) {
      
      toastController.error("Failed to fetch actions");
    }
  };

  useEffect(() => {
    fetchModules();
    fetchSubscriptionDetails();
  }, [subscriptionId]);

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
      // refresh actions for updated selection
      fetchActions(newFeatureIds);
      // clear action selections no longer applicable
      const remainingActionIds = (prev.action_ids || []).filter((aid) => {
        const actionsOfSelected = Object.values(actionsMap).flat();
        return actionsOfSelected.some((a) => a.action_id === aid);
      });
      return {
        ...prev,
        feature_ids: newFeatureIds,
        action_ids: remainingActionIds,
      };
    });
    setValidationStates((prev) => ({
      ...prev,
      feature_ids: false,
    }));
  };

  const handleActionChange = (actionId) => {
    setFormData((prev) => {
      const newActionIds = prev.action_ids.includes(actionId)
        ? prev.action_ids.filter((id) => id !== actionId)
        : [...prev.action_ids, actionId];
      return { ...prev, action_ids: newActionIds };
    });
  };

  const handleModuleToggle = async (moduleId) => {
    setFormData((prev) => {
      const exists = prev.module_ids.includes(moduleId);
      const newModuleIds = exists
        ? prev.module_ids.filter((id) => id !== moduleId)
        : [...prev.module_ids, moduleId];

      return {
        ...prev,
        module_ids: newModuleIds,
        feature_ids: [],
        action_ids: [],
      };
    });

    // Fetch merged features for selected modules
    setTimeout(() => {
      const moduleIds = (formData.module_ids || []).includes(moduleId)
        ? formData.module_ids.filter((id) => id !== moduleId)
        : [...(formData.module_ids || []), moduleId];
      fetchFeaturesForModules(moduleIds);
    }, 0);
  };

  const validateForm = () => {
    // Normalize values
    const normalizedName = (formData.name || "").trim();
    const normalizedPrice = Number.parseFloat(formData.price);
    const hasValidPrice =
      Number.isFinite(normalizedPrice) && normalizedPrice > 0;
    const hasFeatures = features.length > 0;
    const hasSelectedAnyFeature = (formData.feature_ids || []).length > 0;

    const newValidationStates = {
      name: normalizedName.length === 0,
      price: !hasValidPrice,
      tenure:
        !formData.tenure || isNaN(formData.tenure) || formData.tenure <= 0,
      module_ids: (formData.module_ids || []).length === 0,
      feature_ids: hasFeatures ? !hasSelectedAnyFeature : false,
    };

    
    

    setValidationStates(newValidationStates);
    const isValid = !Object.values(newValidationStates).some((state) => state);

    if (!isValid) {
      if (newValidationStates.name) {
        toastController.error("Plan name is required");
      } else if (newValidationStates.price) {
        toastController.error("Please enter a valid price greater than 0");
      } else if (newValidationStates.module_ids) {
        toastController.error("Please select a module");
      } else if (newValidationStates.tenure) {
        toastController.error("Please select tenure");
      } else if (newValidationStates.feature_ids) {
        toastController.error("Please select at least one feature");
      } else {
        toastController.error("Please fill all required fields correctly");
      }
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      // Build payload explicitly; include optional fields conditionally
      const formatTenure = (months) => {
        if (months % 12 === 0)
          return `${months / 12} year${months / 12 > 1 ? "s" : ""}`;
        return `${months} months`;
      };

      const payload = {
        subscription_id: Number(subscriptionId),
        name: (formData.name || "").trim(),
        price: Number.parseFloat(formData.price),
        tenure: formatTenure(formData.tenure),
        module_ids: formData.module_ids,
        feature_ids: formData.feature_ids,
        action_ids: formData.action_ids,
        user_id: adminData.user_id,
        app_source: "admin_app",
      };

      const response = await axios.post(
        `${BASE_URL}/admin/update_subscription`,
        payload,
        {
          headers: {
            Authorization: getToken(),
            "Content-Type": "application/json",
          },
        }
      );

      // Log full response for debugging
      
      

      // Treat any 2xx HTTP response as success, but still show server message when available
      if (response.status >= 200 && response.status < 300) {
        toastController.success(
          response.data?.detail || "Subscription updated successfully"
        );
        // Invalidate subscriptions cache to refresh the list
        queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
        navigate("/subscriptions");
      } else {
        toastController.error(
          response.data?.detail || "Failed to update subscription"
        );
      }
    } catch (error) {
      
      toastController.error(
        error.response?.data?.detail || "Failed to update subscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
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
              Edit Subscription
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
              <span className="hidden sm:inline">
                {isLoading ? "Updating..." : "Save"}
              </span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="">
          {/* Basic Information Section */}
          <section className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4 flex items-center">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
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
                      tenure: Number(e.target.value),
                    }))
                  }
                  className="mt-1 block w-full rounded-3xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
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
            </div>
          </section>

          {/* Modules Section */}
          <section className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4 flex items-center">
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
                            className="form-checkbox h-4 w-4 rounded-3xl border-gray-300 text-brand-500 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 cursor-pointer"
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
                        fetchActions(allIds);
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          feature_ids: [],
                          action_ids: [],
                        }));
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
              {features.map((feature) => (
                <div
                  key={feature.feature_id}
                  onClick={() => handleFeatureChange(feature.feature_id)}
                  className={`
                    bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm 
                    border cursor-pointer select-none
                    ${
                      formData.feature_ids.includes(feature.feature_id)
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-900/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-brand-500/50 dark:hover:border-brand-500/50"
                    }
                    transition-all duration-200 ease-in-out
                  `}
                >
                  <div className="flex items-center space-x-3 w-full cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.feature_ids.includes(
                        feature.feature_id
                      )}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => handleFeatureChange(feature.feature_id)}
                      className="form-checkbox h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 cursor-pointer"
                    />
                    <span
                      className={`
                      text-sm font-medium pl-2
                      ${
                        formData.feature_ids.includes(feature.feature_id)
                          ? "text-brand-700 dark:text-brand-400"
                          : "text-gray-700 dark:text-gray-300"
                      }
                    `}
                    >
                      {feature.name.split("_").join(" ").toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
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

export default EditSubscription;
