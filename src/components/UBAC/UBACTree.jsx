import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { faTrash, faChevronLeft, faPlus, faRotate, faMagnifyingGlass, faTimes } from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";
import useUbacTree from "../../lib/react-query/hooks/useUbacTree";
import { useAuth } from "../../hooks/useAuth";
import { API_CONFIG } from "../../config/appConfig";
import Modal from "../common/Modal";
import { toastController } from "../../utils/toastController";

const UBACTree = () => {
  const { data, isLoading, refetchUbacTree } = useUbacTree();
  const { getToken } = useAuth();
  const { BASE_URL } = API_CONFIG;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState("module"); // module | feature | action
  const [modulesList, setModulesList] = useState([]);
  const [featuresList, setFeaturesList] = useState([]);
  const [formName, setFormName] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedFeatureId, setSelectedFeatureId] = useState("");
  const [loadingSave, setLoadingSave] = useState(false);
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editType, setEditType] = useState("module"); // module | feature | action
  const [editId, setEditId] = useState(null);
  const [editFormName, setEditFormName] = useState("");
  const [editSelectedModuleId, setEditSelectedModuleId] = useState("");
  const [editSelectedFeatureId, setEditSelectedFeatureId] = useState("");
  const [editLoadingSave, setEditLoadingSave] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // load modules on mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = getToken() || localStorage.getItem("token");
        const headers = token
          ? { Authorization: token, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" };

        // DEBUG: show token and headers for troubleshooting auth
        
        

        const res = await fetch(`${BASE_URL}/admin/get_modules`, {
          method: "GET",
          headers,
        });

        if (res.status === 401 || res.status === 403) {
          
          setModulesList([]);
          return;
        }

        const json = await res.json();
        const data = json.data || json || [];
        setModulesList(Array.isArray(data) ? data : []);
      } catch (err) {
        
        setModulesList([]);
      }
    };

    fetchModules();
  }, []);

  // load features when module is selected
  useEffect(() => {
    if (!selectedModuleId) {
      setFeaturesList([]);
      return;
    }

    const fetchFeatures = async () => {
      try {
        const token = getToken() || localStorage.getItem("token");
        const body = {
          outlet_id: 6473,
          app_source: "pos_app",
          module_id: Number(selectedModuleId),
        };

        const headers = token
          ? { Authorization: token, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" };

        // DEBUG: show token and headers for troubleshooting auth
        

        const query = new URLSearchParams({
          module_id: String(body.module_id),
          outlet_id: String(body.outlet_id),
          app_source: body.app_source,
        }).toString();

        // include query string so API receives module_id/outlet_id/app_source
        const url = `${BASE_URL}/admin/get_features?${query}`;
        

        const res = await fetch(url, {
          method: "GET",
          headers,
        });

        

        if (res.status === 401 || res.status === 403) {
          
          setFeaturesList([]);
          return;
        }

        if (!res.ok) {
          
          setFeaturesList([]);
          return;
        }

        const json = await res.json();
        // API may return features in different shapes: { data: [...] } or { features: [...] } or { ..., features: [...] }
        const incoming = json.data || json.features || json || [];
        const features = Array.isArray(incoming)
          ? incoming
          : incoming.features || [];
        setFeaturesList(features);
      } catch (err) {
        
        setFeaturesList([]);
      }
    };

    fetchFeatures();
  }, [selectedModuleId]);

  const items = [
    { label: "Home", path: "/home" },
    { label: "UBAC Tree", path: "/ubac_tree" },
  ];

  // Render actions horizontally with connector (compact)
  const renderActions = (actions) => (
    <div className="flex items-center gap-2 ml-4">
      {actions.map((action) => (
        <div key={action.action_id} className="flex flex-col items-center">
          <div className="h-3 w-0.5 bg-gray-300 mb-2" />
          <div className="px-2 py-1 rounded bg-white border text-xs whitespace-nowrap flex items-center gap-2">
            <span>{action.name}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // open edit modal for action
                  setEditType("action");
                  setEditId(action.action_id);
                  setEditFormName(action.name || "");
                  setEditSelectedFeatureId(
                    action.feature_id || selectedFeatureId
                  );
                  setIsEditModalOpen(true);
                }}
                className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
                title="Edit action"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
              </button>
              {/* Delete action (always allowed) */}
              <button
                onClick={async () => {
                  if (!confirm("Delete action? This cannot be undone.")) return;
                  try {
                    const token = getToken() || localStorage.getItem("token");
                    const headers = token
                      ? {
                          Authorization: token,
                          "Content-Type": "application/json",
                        }
                      : { "Content-Type": "application/json" };

                    const resp = await fetch(
                      `${BASE_URL}/admin/delete_actions`,
                      {
                        method: "DELETE",
                        headers,
                        body: JSON.stringify({
                          action_ids: [Number(action.action_id)],
                        }),
                      }
                    );

                    if (!resp.ok) {
                      const errJson = await resp.json().catch(() => ({}));
                      toastController.error(
                        errJson.detail || errJson.message || "Delete failed"
                      );
                      return;
                    }

                    await refetchUbacTree();
                    toastController.success("Deleted successfully");
                  } catch (err) {
                    
                    toastController.error("Delete failed");
                  }
                }}
                className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
                title="Delete action"
              >
                <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render features vertically; show first 3, then a 'See more' card toggling full list
  const renderFeatures = (features, moduleId) => {
    const isExpanded = Boolean(expandedModules[moduleId]);

    // items to show when not expanded
    const visible = isExpanded ? features : features.slice(0, 3);

    return (
      <div className="flex flex-col items-start ml-6">
        {visible.map((feature) => (
          <div key={feature.feature_id} className="flex items-center mb-4">
            <div className="w-6 h-0.5 bg-gray-300 mr-2" />
            <div className="flex flex-col">
              <div className="min-w-[140px] max-w-xs px-4 py-2 rounded bg-white border shadow-sm text-center font-medium break-words">
                <div className="flex items-center justify-between gap-2">
                  <span className="break-words">{feature.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // open edit modal for feature
                        setEditType("feature");
                        setEditId(feature.feature_id);
                        setEditFormName(feature.name || "");
                        setEditSelectedModuleId(moduleId);
                        setIsEditModalOpen(true);
                      }}
                      className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition ml-2"
                      title="Edit feature"
                    >
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        className="w-4 h-4"
                      />
                    </button>
                    {/* Delete feature - only render if no actions assigned */}
                    {!(
                      Array.isArray(feature.actions) &&
                      feature.actions.length > 0
                    ) && (
                      <button
                        onClick={async () => {
                          if (
                            !confirm(
                              "Delete feature? This will remove the feature."
                            )
                          )
                            return;
                          try {
                            const token =
                              getToken() || localStorage.getItem("token");
                            const headers = token
                              ? {
                                  Authorization: token,
                                  "Content-Type": "application/json",
                                }
                              : { "Content-Type": "application/json" };

                            const resp = await fetch(
                              `${BASE_URL}/admin/delete_features`,
                              {
                                method: "DELETE",
                                headers,
                                body: JSON.stringify({
                                  feature_ids: [Number(feature.feature_id)],
                                  user_id: String(2),
                                  app_source: "admin_app",
                                }),
                              }
                            );

                            if (!resp.ok) {
                              const errJson = await resp
                                .json()
                                .catch(() => ({}));
                              toastController.error(
                                errJson.detail ||
                                  errJson.message ||
                                  "Delete failed"
                              );
                              return;
                            }

                            await refetchUbacTree();
                            toastController.success("Deleted successfully");
                          } catch (err) {
                           
                            toastController.error("Delete failed");
                          }
                        }}
                        className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
                        title="Delete feature"
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="w-3.5 h-3.5"
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="h-3 w-0.5 bg-gray-300 ml-[70px]" />
              {feature.actions && renderActions(feature.actions)}
            </div>
          </div>
        ))}

        {features.length > 3 && (
          <div className="flex items-center mb-4">
            <div className="w-6 h-0.5 bg-gray-300 mr-2" />
            <div
              className="min-w-[140px] px-4 py-2 rounded bg-white border shadow-sm font-medium cursor-pointer text-center"
              onClick={() =>
                setExpandedModules((prev) => ({
                  ...prev,
                  [moduleId]: !prev[moduleId],
                }))
              }
            >
              {isExpanded ? "See less" : `+${features.length - 3} more`}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render modules vertically with connectors to features
  const renderModules = (modules) => (
    <div className="flex flex-col gap-6 py-4">
      {modules.map((module) => (
        <div key={module.module_id} className="flex items-start">
          <div className="flex flex-col items-center">
            <div className="px-4 py-2 rounded bg-gray-100 border font-semibold text-center min-w-[220px]">
              <div className="flex items-center justify-between gap-2">
                <span className="break-words">{module.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // open edit modal for module
                      setEditType("module");
                      setEditId(module.module_id);
                      setEditFormName(module.name || "");
                      setIsEditModalOpen(true);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition ml-2"
                    title="Edit module"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
                  </button>
                  {/* Delete module - only render if no features assigned */}
                  {!(
                    Array.isArray(module.features) && module.features.length > 0
                  ) && (
                    <button
                      onClick={async () => {
                        if (
                          !confirm("Delete module? This will remove the module.")
                        )
                          return;
                        try {
                          const token =
                            getToken() || localStorage.getItem("token");
                          const headers = token
                            ? {
                                Authorization: token,
                                "Content-Type": "application/json",
                              }
                            : { "Content-Type": "application/json" };

                          const resp = await fetch(
                            `${BASE_URL}/admin/delete_modules`,
                            {
                              method: "DELETE",
                              headers,
                              body: JSON.stringify({
                                module_ids: [Number(module.module_id)],
                              }),
                            }
                          );

                          if (!resp.ok) {
                            const errJson = await resp.json().catch(() => ({}));
                            toastController.error(
                              errJson.detail || errJson.message || "Delete failed"
                            );
                            return;
                          }

                          await refetchUbacTree();
                          toastController.success("Deleted successfully");
                        } catch (err) {
                          
                          toastController.error("Delete failed");
                        }
                      }}
                      className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition ml-2"
                      title="Delete module"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="w-0.5 h-6 bg-gray-300 mt-2" />
          </div>
          <div className="ml-4">
            {module.features &&
              renderFeatures(module.features, module.module_id)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Breadcrumb - Moved outside the card */}
      <div className="mb-6">
        <Breadcrumb items={items} />
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-hidden pt-4">
          {/* Header Section */}
          <div className="flex items-center px-6 mb-3">
            {/* Left Side - Back Button */}
            <div>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-full border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                UBAC Tree
              </h2>
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={refetchUbacTree}
                disabled={isLoading}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reload data"
              >
                <FontAwesomeIcon
                  icon={faRotate}
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-full bg-success-500 hover:bg-success-600 shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>

          {/* Stats and Search Row */}
          <div className="flex items-center justify-between px-6 mb-4">
            {/* Left - Stats */}
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium text-gray-800">
                Modules: {data && data.data ? data.data.length : 0}
              </span>
              <span className="font-medium text-gray-800">
                Features: {data && data.data
                  ? data.data.reduce(
                      (acc, m) =>
                        acc + (Array.isArray(m.features) ? m.features.length : 0),
                      0
                    )
                  : 0}
              </span>
              <span className="font-medium text-gray-800">
                Actions: {data && data.data
                  ? data.data.reduce(
                      (acc, m) =>
                        acc +
                        (Array.isArray(m.features)
                          ? m.features.reduce(
                              (faAcc, f) =>
                                faAcc +
                                (Array.isArray(f.actions) ? f.actions.length : 0),
                              0
                            )
                          : 0),
                      0
                    )
                  : 0}
              </span>
            </div>

            {/* Right - Search */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
              </span>
              <input
                placeholder="Search modules, features, actions..."
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 h-10 w-[250px] rounded-lg border border-gray-200 bg-transparent py-2 pr-4 pl-12 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSearchTerm("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                  title="Clear search"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            renderModules(
              // filter modules/features/actions by search term
              (data.data || []).filter((m) => {
                if (!searchTerm) return true;
                const q = searchTerm.toLowerCase();
                // match module name
                if (m.name && m.name.toLowerCase().includes(q)) return true;
                // match features or actions
                if (
                  m.features &&
                  m.features.some((f) => {
                    if (f.name && f.name.toLowerCase().includes(q)) return true;
                    if (
                      f.actions &&
                      f.actions.some(
                        (a) => a.name && a.name.toLowerCase().includes(q)
                      )
                    )
                      return true;
                    return false;
                  })
                )
                  return true;
                return false;
              })
            )
          )}
        </div>
      </div>

      {/* Create Modal (use shared Modal component for consistent appearance) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create"
        size="small"
        actionButtons={
          <>
            <button
              className="px-3 py-1 border rounded"
              onClick={() => setIsModalOpen(false)}
              disabled={loadingSave}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 bg-brand-500 text-white rounded"
              onClick={async () => {
                setLoadingSave(true);
                try {
                  const token = getToken() || localStorage.getItem("token");
                  const headers = token
                    ? {
                        Authorization: token,
                        "Content-Type": "application/json",
                      }
                    : { "Content-Type": "application/json" };

                  let resp;
                  if (type === "module") {
                    resp = await fetch(
                      `${BASE_URL}/admin/create_module`,
                      {
                        method: "POST",
                        headers,
                        body: JSON.stringify({ name: formName }),
                      }
                    );
                  } else if (type === "feature") {
                    resp = await fetch(
                      `${BASE_URL}/admin/create_feature`,
                      {
                        method: "POST",
                        headers,
                        body: JSON.stringify({
                          module_id: Number(selectedModuleId),
                          name: formName,
                        }),
                      }
                    );
                  } else if (type === "action") {
                    resp = await fetch(
                      `${BASE_URL}/admin/create_action`,
                      {
                        method: "POST",
                        headers,
                        body: JSON.stringify({
                          feature_id: Number(selectedFeatureId),
                          name: formName,
                        }),
                      }
                    );
                  }

                  if (resp && !resp.ok) {
                    try {
                      const errJson = await resp.json();
                      const message =
                        errJson.detail ||
                        errJson.message ||
                        JSON.stringify(errJson);
                      toastController.error(message);
                      throw new Error(message);
                    } catch (parseErr) {
                      toastController.error("Save failed");
                      throw parseErr;
                    }
                  }

                  await refetchUbacTree();
                  setIsModalOpen(false);
                  setFormName("");
                  setSelectedFeatureId("");
                  setSelectedModuleId("");
                } catch (err) {
                 
                  toastController.error("Save failed");
                } finally {
                  setLoadingSave(false);
                }
              }}
              disabled={
                loadingSave ||
                (type !== "module" && !selectedModuleId) ||
                (type === "action" && !selectedFeatureId) ||
                !formName
              }
            >
              {loadingSave ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        <div className="mb-3">
          <label className="block text-sm mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border px-2 py-1"
          >
            <option value="module">Module</option>
            <option value="feature">Feature</option>
            <option value="action">Action</option>
          </select>
        </div>

        {(type === "feature" || type === "action") && (
          <div className="mb-3">
            <label className="block text-sm mb-1">Module</label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full border px-2 py-1"
            >
              <option value="">Select module</option>
              {modulesList.map((m) => (
                <option key={m.module_id} value={m.module_id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {type === "action" && (
          <div className="mb-3">
            <label className="block text-sm mb-1">Feature</label>
            <select
              value={selectedFeatureId}
              onChange={(e) => setSelectedFeatureId(e.target.value)}
              className="w-full border px-2 py-1"
            >
              <option value="">Select feature</option>
              {featuresList.map((f) => (
                <option key={f.feature_id} value={f.feature_id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm mb-1">Name</label>
          <input
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="w-full border px-2 py-1"
          />
        </div>
      </Modal>

      {/* Edit Modal for Module / Feature / Action */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit ${editType}`}
        size="small"
        actionButtons={
          <>
            <button
              className="px-3 py-1 border rounded"
              onClick={() => setIsEditModalOpen(false)}
              disabled={editLoadingSave}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 bg-brand-500 text-white rounded"
              onClick={async () => {
                setEditLoadingSave(true);
                try {
                  const token = getToken() || localStorage.getItem("token");
                  const headers = token
                    ? {
                        Authorization: token,
                        "Content-Type": "application/json",
                      }
                    : { "Content-Type": "application/json" };

                  let resp;
                  if (editType === "module") {
                    resp = await fetch(
                      `${BASE_URL}/admin/update_module`,
                      {
                        method: "PATCH",
                        headers,
                        body: JSON.stringify({
                          module_id: Number(editId),
                          name: editFormName,
                        }),
                      }
                    );
                  } else if (editType === "feature") {
                    resp = await fetch(
                      `${BASE_URL}/admin/update_feature`,
                      {
                        method: "PATCH",
                        headers,
                        body: JSON.stringify({
                          feature_id: Number(editId),
                          name: editFormName,
                          module_id: editSelectedModuleId
                            ? Number(editSelectedModuleId)
                            : undefined,
                        }),
                      }
                    );
                  } else if (editType === "action") {
                    resp = await fetch(
                      `${BASE_URL}/admin/update_action`,
                      {
                        method: "PATCH",
                        headers,
                        body: JSON.stringify({
                          action_id: Number(editId),
                          name: editFormName,
                          feature_id: editSelectedFeatureId
                            ? Number(editSelectedFeatureId)
                            : undefined,
                        }),
                      }
                    );
                  }

                  if (resp && !resp.ok) {
                    try {
                      const errJson = await resp.json();
                      const message =
                        errJson.detail ||
                        errJson.message ||
                        JSON.stringify(errJson);
                      toastController.error(message);
                      throw new Error(message);
                    } catch (parseErr) {
                      toastController.error("Save failed");
                      throw parseErr;
                    }
                  }

                  await refetchUbacTree();
                  setIsEditModalOpen(false);
                  setEditFormName("");
                  setEditSelectedFeatureId("");
                  setEditSelectedModuleId("");
                  setEditId(null);
                } catch (err) {
                 
                  toastController.error("Save failed");
                } finally {
                  setEditLoadingSave(false);
                }
              }}
              disabled={
                editLoadingSave ||
                !editFormName ||
                (editType === "feature" && !editSelectedModuleId) ||
                (editType === "action" && !editSelectedFeatureId)
              }
            >
              {editLoadingSave ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        {/* Build a flat list of features for easy selection */}
        {(() => {
          const allFeatures = modulesList.reduce((acc, m) => {
            if (Array.isArray(m.features)) {
              m.features.forEach((f) =>
                acc.push({ ...f, module_id: m.module_id })
              );
            }
            return acc;
          }, []);

          return (
            <>
              {editType === "feature" && (
                <div className="mb-3">
                  <label className="block text-sm mb-1">Module</label>
                  <select
                    value={editSelectedModuleId}
                    onChange={(e) => setEditSelectedModuleId(e.target.value)}
                    className="w-full border px-2 py-1"
                  >
                    <option value="">Select module</option>
                    {modulesList.map((m) => (
                      <option key={m.module_id} value={m.module_id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editType === "action" && (
                <div className="mb-3">
                  <label className="block text-sm mb-1">Feature</label>
                  <select
                    value={editSelectedFeatureId}
                    onChange={(e) => setEditSelectedFeatureId(e.target.value)}
                    className="w-full border px-2 py-1"
                  >
                    <option value="">Select feature</option>
                    {allFeatures.map((f) => (
                      <option key={f.feature_id} value={f.feature_id}>
                        {`${f.name} (${
                          modulesList.find((m) => m.module_id === f.module_id)
                            ?.name || ""
                        })`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm mb-1">Name</label>
                <input
                  value={editFormName}
                  onChange={(e) => setEditFormName(e.target.value)}
                  className="w-full border px-2 py-1"
                />
              </div>
            </>
          );
        })()}
      </Modal>
    </>
  );
};

export default UBACTree;
