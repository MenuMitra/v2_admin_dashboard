import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faPlus, faRotate, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "../Breadcrumb";
import useUbacTree from "../../lib/react-query/hooks/useUbacTree";
import { useAuth } from "../../hooks/useAuth";
import { API_CONFIG } from "../../config/appConfig";
import Modal from "../common/Modal";
import { toastController } from "../../utils/toastController";
import ApexTree from "apextree";

const UBACTree = () => {
  const { data, isLoading, refetchUbacTree } = useUbacTree();
  const { getToken } = useAuth();
  const { BASE_URL } = API_CONFIG;
  const treeContainerRef = useRef(null);


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
  const [editType] = useState("module"); // module | feature | action
  const [editId, setEditId] = useState(null);
  const [editFormName, setEditFormName] = useState("");
  const [editSelectedModuleId, setEditSelectedModuleId] = useState("");
  const [editSelectedFeatureId, setEditSelectedFeatureId] = useState("");
  const [editLoadingSave, setEditLoadingSave] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Transform API data to ApexTree format
  const transformUbacDataToTree = (apiResponse) => {
    if (!apiResponse?.data || !Array.isArray(apiResponse.data)) {
      return null;
    }

    // Root node
    const rootNode = {
      id: 'UBAC_Root',
      data: { 
        name: 'UBAC System',
        stats: `${apiResponse.total_modules || 0} Modules | ${apiResponse.total_features || 0} Features | ${apiResponse.total_actions || 0} Actions`
      },
      options: { nodeBGColor: '#94ddff' }, // Blue for root
      children: []
    };

    // Transform each module
    apiResponse.data.forEach(module => {
      const moduleNode = {
        id: `module_${module.module_id}`,
        data: { name: module.name },
        options: { nodeBGColor: '#ffc7c2' }, // Red for modules
        children: []
      };

      // Transform features in this module
      if (module.features && Array.isArray(module.features) && module.features.length > 0) {
        module.features.forEach(feature => {
          const featureNode = {
            id: `feature_${feature.feature_id}`,
            data: { name: feature.name },
            options: { nodeBGColor: '#e3c2ff' }, // Purple for features
            children: []
          };

          // Transform actions in this feature
          if (feature.actions && Array.isArray(feature.actions) && feature.actions.length > 0) {
            feature.actions.forEach(action => {
              const actionNode = {
                id: `action_${action.action_id}`,
                data: { name: action.name },
                options: { nodeBGColor: '#d2edc5' }, // Green for actions
              };
              featureNode.children.push(actionNode);
            });
          }

          moduleNode.children.push(featureNode);
        });
      }

      rootNode.children.push(moduleNode);
    });

    return rootNode;
  };

  // Filter tree data based on search term
  const filterTreeData = (apiResponse, searchTerm) => {
    if (!searchTerm || !apiResponse?.data) {
      return apiResponse;
    }

    const filteredModules = apiResponse.data.filter(module => {
      // Check if module name matches
      if (module.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }

      // Check if any feature matches
      if (module.features && Array.isArray(module.features)) {
        const filteredFeatures = module.features.filter(feature => {
          // Check if feature name matches
          if (feature.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return true;
          }

          // Check if any action matches
          if (feature.actions && Array.isArray(feature.actions)) {
            const filteredActions = feature.actions.filter(action =>
              action.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (filteredActions.length > 0) {
              // Update feature with filtered actions
              feature.actions = filteredActions;
              return true;
            }
          }

          return false;
        });

        if (filteredFeatures.length > 0) {
          // Update module with filtered features
          module.features = filteredFeatures;
          return true;
        }
      }

      return false;
    });

    return {
      ...apiResponse,
      data: filteredModules
    };
  };

  // Initialize ApexTree
  useEffect(() => {
    const container = treeContainerRef.current;
    if (!container || !data?.data || isLoading) return;

    // Clear any existing content
    container.innerHTML = '';

    // Apply search filter if search term exists
    const filteredData = searchTerm 
      ? filterTreeData(data, searchTerm)
      : data;

    // Transform API data to ApexTree format
    const treeData = transformUbacDataToTree(filteredData);
    
    if (!treeData) {
      console.warn('No tree data available to render');
      return;
    }

    // ApexTree configuration matching the HTML example
    const options = {
      contentKey: 'data',
      width: "100%",
      height: 'auto',
      nodeWidth: 150,
      nodeHeight: 70,
      childrenSpacing: 70,
      siblingSpacing: 30,
      direction: 'left',
      // Auto-fit content settings
      autoFit: true,
      padding: 20, // Add padding around the content
      // Disable manual zoom and pan
      zoom: false,
      pan: false,
      nodeTemplate: (content) => {
        const stats = content.stats ? `<div style="font-size: 10px; color: #666; margin-top: 2px;">${content.stats}</div>` : '';
        return `<div style='display: flex;flex-direction: column;justify-content: center;align-items: center;height: 100%; padding: 0 7px; text-align: center;'>
          <div style="font-weight: bold; font-family: Arial; font-size: 14px">${content.name}</div>
          ${stats}
        </div>`;
      },
      nodeStyle: 'box-shadow: -3px 6px 8px -5px rgba(0,0,0,0.31)',
      canvasStyle: 'background: #fff;',
    };

    // Initialize and render the tree
    try {
      const tree = new ApexTree(container, options);
      tree.render(treeData);
      
      // Alternative: Manually fit content after rendering
      setTimeout(() => {
        if (tree.fit) {
          tree.fit(); // Call fit method if available
        }
      }, 100);
    } catch (error) {
      console.error('Error initializing ApexTree:', error);
    }

    // Cleanup function
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [data, searchTerm, isLoading]); // Updated dependencies

  // load modules on mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = getToken() || localStorage.getItem("token");
        const headers = token
          ? { Authorization: token, "Content-Type": "application/json" }
          : { "Content-Type": "application/json" };

        // DEBUG: show token and headers for troubleshooting auth
        console.log("UBAC: fetchModules getToken() =>", getToken());
        console.log("UBAC: fetchModules headers =>", headers);

        const res = await fetch(`${BASE_URL}/admin/get_modules`, {
          method: "GET",
          headers,
        });

        if (res.status === 401 || res.status === 403) {
          console.warn("Unauthorized when fetching modules", res.status);
          setModulesList([]);
          return;
        }

        const json = await res.json();
        const data = json.data || json || [];
        setModulesList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load modules", err);
        setModulesList([]);
      }
    };

    fetchModules();
  }, [BASE_URL, getToken]);

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
        console.log("UBAC: fetchFeatures getToken() =>", getToken());
        console.log("UBAC: fetchFeatures headers =>", headers);

        const query = new URLSearchParams({
          module_id: String(body.module_id),
          outlet_id: String(body.outlet_id),
          app_source: body.app_source,
        }).toString();

        // include query string so API receives module_id/outlet_id/app_source
        const url = `${BASE_URL}/admin/get_features?${query}`;
        console.log("UBAC: fetchFeatures url =>", url);

        const res = await fetch(url, {
          method: "GET",
          headers,
        });

        console.log("UBAC: fetchFeatures status =>", res.status);

        if (res.status === 401 || res.status === 403) {
          console.warn("Unauthorized when fetching features", res.status);
          setFeaturesList([]);
          return;
        }

        if (!res.ok) {
          console.error("Failed to fetch features, status:", res.status);
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
        console.error("Failed to load features", err);
        setFeaturesList([]);
      }
    };

    fetchFeatures();
  }, [selectedModuleId, BASE_URL, getToken]);

  const items = [
    { label: "Home", path: "/home" },
    { label: "UBAC Tree", path: "/ubac_tree" },
  ];




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
            </div>
          </div>
        </div>

        {/* ApexTree Container */}
        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                <p className="text-sm text-gray-600">Loading UBAC tree...</p>
              </div>
            </div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No UBAC data available</h3>
                <p className="text-sm text-gray-500">Create modules, features, and actions to see the tree structure.</p>
              </div>
            </div>
          ) : (
            <div 
              id="svg-tree" 
              ref={treeContainerRef}
              style={{ margin: '0 auto', minHeight: '400px' }}
            />
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
                  console.error(err);
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
                  console.error(err);
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
