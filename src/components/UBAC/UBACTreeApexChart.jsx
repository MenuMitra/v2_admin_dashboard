import React, { useState, useEffect, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faPlus, faRotate, faMagnifyingGlass, faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import SaveButton from "../common/SaveButton";
import Breadcrumb from "../Breadcrumb";
import useUbacTree from "../../lib/react-query/hooks/useUbacTree";
import { useAuth } from "../../hooks/useAuth";
import { API_CONFIG } from "../../config/appConfig";
import Modal from "../common/Modal";
import { toastController } from "../../utils/toastController";
import ApexTree from "apextree";
import CustomDropdown from "../common/CustomDropdown";

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
  const [editType, setEditType] = useState("module"); // module | feature | action
  const [editId, setEditId] = useState(null);
  const [editFormName, setEditFormName] = useState("");
  const [editSelectedModuleId, setEditSelectedModuleId] = useState("");
  const [editSelectedFeatureId, setEditSelectedFeatureId] = useState("");
  const [editLoadingSave, setEditLoadingSave] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Utility function to clean field names
  const cleanFieldName = (name) => {
    if (!name) return '';
    return name
      .replace(/_/g, ' ')  // Replace underscores with spaces
      .toUpperCase();     // Convert to uppercase
  };

  // Color assignment function for module lineage
  const getNodeColor = (moduleIndex, nodeType) => {
    const colorPalette = [
      {
        module: 'linear-gradient(135deg, #FF4757 0%, #FFA502 100%)',  // Red to Orange
        feature: '#FF6348',
        action: '#FFA07A'
      },  // Red-Orange family
      {
        module: 'linear-gradient(135deg, #1E90FF 0%, #00CED1 100%)',  // Blue to Cyan
        feature: '#4FC3F7',
        action: '#81D4FA'
      },  // Blue-Cyan family
      {
        module: 'linear-gradient(135deg, #2ECC71 0%, #3498DB 100%)',  // Green to Blue
        feature: '#5DADE2',
        action: '#85C1E9'
      },  // Green-Blue family
      {
        module: 'linear-gradient(135deg, #9B59B6 0%, #E91E63 100%)',  // Purple to Pink
        feature: '#BA68C8',
        action: '#CE93D8'
      },  // Purple-Pink family
      {
        module: 'linear-gradient(135deg, #F39C12 0%, #E74C3C 100%)',  // Orange to Red
        feature: '#FF7043',
        action: '#FFAB91'
      },  // Orange-Red family
      {
        module: 'linear-gradient(135deg, #16A085 0%, #F4D03F 100%)',  // Teal to Yellow
        feature: '#4DB6AC',
        action: '#80CBC4'
      },  // Teal-Yellow family
      {
        module: 'linear-gradient(135deg, #8E44AD 0%, #3498DB 100%)',  // Purple to Blue
        feature: '#7986CB',
        action: '#9FA8DA'
      },  // Purple-Blue family
      {
        module: 'linear-gradient(135deg, #C0392B 0%, #F39C12 100%)',  // Dark Red to Orange
        feature: '#E57373',
        action: '#EF9A9A'
      },  // Red-Orange family
      {
        module: 'linear-gradient(135deg, #D35400 0%, #FFC300 100%)',  // Dark Orange to Yellow
        feature: '#FFB74D',
        action: '#FFCC80'
      },  // Orange-Yellow family
    ];

    const paletteIndex = moduleIndex % colorPalette.length;
    return colorPalette[paletteIndex][nodeType];
  };

  // Fetch modules function (extracted for reusability)
  const fetchModules = useCallback(async () => {
    try {
      const token = getToken() || localStorage.getItem("token");
      const headers = token
        ? { Authorization: token, "Content-Type": "application/json" }
        : { "Content-Type": "application/json" };

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
  }, [BASE_URL, getToken]);

  // Fetch features function (extracted for reusability)
  const fetchFeatures = useCallback(async (moduleId) => {
    if (!moduleId) {
      setFeaturesList([]);
      return;
    }

    try {
      const token = getToken() || localStorage.getItem("token");
      const body = {
        outlet_id: 6473,
        app_source: "pos_app",
        module_id: Number(moduleId),
      };

      const headers = token
        ? { Authorization: token, "Content-Type": "application/json" }
        : { "Content-Type": "application/json" };

      const query = new URLSearchParams({
        module_id: String(body.module_id),
        outlet_id: String(body.outlet_id),
        app_source: body.app_source,
      }).toString();

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
      const incoming = json.data || json.features || json || [];
      const features = Array.isArray(incoming)
        ? incoming
        : incoming.features || [];
      setFeaturesList(features);
    } catch (err) {

      setFeaturesList([]);
    }
  }, [BASE_URL, getToken]);

  // Transform API data to ApexTree format
  const transformUbacDataToTree = (apiResponse) => {
    if (!apiResponse?.data || !Array.isArray(apiResponse.data)) {
      return null;
    }

    // Root node
    const rootNode = {
      id: 'UBAC_Root',
      data: {
        name: 'UBAC SYSTEM',
        stats: `${apiResponse.total_modules || 0} Modules | ${apiResponse.total_features || 0} Features | ${apiResponse.total_actions || 0} Actions`,
        nodeType: 'root',
        originalId: 'root',
        hasChildren: true,
        childrenCount: apiResponse.data.length
      },
      options: { nodeBGColor: '#94ddff' }, // Blue for root
      children: []
    };

    // Transform each module
    apiResponse.data.forEach((module, moduleIndex) => {
      const hasFeatures = module.features && Array.isArray(module.features) && module.features.length > 0;
      const moduleNode = {
        id: `module_${module.module_id}`,
        data: {
          name: cleanFieldName(module.name),
          nodeType: 'module',
          originalId: module.module_id,
          moduleIndex: moduleIndex,
          hasChildren: hasFeatures,
          childrenCount: hasFeatures ? module.features.length : 0
        },
        options: { nodeBGColor: getNodeColor(moduleIndex, 'module') },
        children: []
      };

      // Transform features in this module
      if (hasFeatures) {
        module.features.forEach(feature => {
          const hasActions = feature.actions && Array.isArray(feature.actions) && feature.actions.length > 0;
          const featureNode = {
            id: `feature_${feature.feature_id}`,
            data: {
              name: cleanFieldName(feature.name),
              nodeType: 'feature',
              originalId: feature.feature_id,
              moduleIndex: moduleIndex,
              hasChildren: hasActions,
              childrenCount: hasActions ? feature.actions.length : 0
            },
            options: { nodeBGColor: getNodeColor(moduleIndex, 'feature') },
            children: []
          };

          // Transform actions in this feature
          if (hasActions) {
            feature.actions.forEach(action => {
              const actionNode = {
                id: `action_${action.action_id}`,
                data: {
                  name: cleanFieldName(action.name),
                  nodeType: 'action',
                  originalId: action.action_id,
                  moduleIndex: moduleIndex,
                  hasChildren: false,
                  childrenCount: 0
                },
                options: { nodeBGColor: getNodeColor(moduleIndex, 'action') },
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

  // Handle Edit Node Button Click
  const handleEditNode = useCallback((nodeId, nodeType) => {
    if (nodeType === 'module') {
      const module = data.data.find(m => m.module_id === Number(nodeId));
      setEditType('module');
      setEditId(module.module_id);
      setEditFormName(module.name);
      setIsEditModalOpen(true);
    } else if (nodeType === 'feature') {
      // Find feature in modules
      let feature = null;
      let moduleId = null;
      for (const module of data.data) {
        const f = module.features?.find(f => f.feature_id === Number(nodeId));
        if (f) {
          feature = f;
          moduleId = module.module_id;
          break;
        }
      }
      setEditType('feature');
      setEditId(feature.feature_id);
      setEditFormName(feature.name);
      setEditSelectedModuleId(moduleId);
      setIsEditModalOpen(true);
    } else if (nodeType === 'action') {
      // Find action in features
      let action = null;
      let featureId = null;
      for (const module of data.data) {
        for (const feature of module.features || []) {
          const a = feature.actions?.find(a => a.action_id === Number(nodeId));
          if (a) {
            action = a;
            featureId = feature.feature_id;
            break;
          }
        }
        if (action) break;
      }
      setEditType('action');
      setEditId(action.action_id);
      setEditFormName(action.name);
      setEditSelectedFeatureId(featureId);
      setIsEditModalOpen(true);
    }
  }, [data]);

  // Handle Delete Node Button Click
  const handleDeleteNode = useCallback(async (nodeId, nodeType) => {
    if (!confirm(`Delete this ${nodeType}? This cannot be undone.`)) return;

    try {
      const token = getToken() || localStorage.getItem("token");
      const headers = token
        ? { Authorization: token, "Content-Type": "application/json" }
        : { "Content-Type": "application/json" };

      let resp;
      if (nodeType === 'module') {
        resp = await fetch(`${BASE_URL}/admin/delete_modules`, {
          method: "DELETE",
          headers,
          body: JSON.stringify({ module_ids: [Number(nodeId)] }),
        });
      } else if (nodeType === 'feature') {
        resp = await fetch(`${BASE_URL}/admin/delete_features`, {
          method: "DELETE",
          headers,
          body: JSON.stringify({
            feature_ids: [Number(nodeId)],
            user_id: String(2),
            app_source: "admin_app",
          }),
        });
      } else if (nodeType === 'action') {
        resp = await fetch(`${BASE_URL}/admin/delete_actions`, {
          method: "DELETE",
          headers,
          body: JSON.stringify({ action_ids: [Number(nodeId)] }),
        });
      }

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        toastController.error(errJson.detail || errJson.message || "Delete failed");
        return;
      }

      await refetchUbacTree();
      toastController.success("Deleted successfully");
    } catch (err) {

      toastController.error("Delete failed");
    }
  }, [BASE_URL, getToken, refetchUbacTree]);

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

      return;
    }

    // ApexTree configuration matching the HTML example
    const options = {
      contentKey: 'data',
      width: "100%",
      height: 'auto',
      nodeWidth: 250,
      nodeHeight: 100,
      childrenSpacing: 70,
      siblingSpacing: 30,
      direction: 'left',
      // Auto-fit content settings
      autoFit: true,
      padding: 5, // Add padding around the content
      // Disable manual zoom and pan
      zoom: false,
      pan: false,
      nodeTemplate: (content) => {
        const showDelete = !content.hasChildren;
        const showEdit = content.nodeType !== 'root'; // Hide edit button for root node

        // Calculate dynamic width based on text length
        // Average character width ~8px, add padding for buttons and spacing
        // const textLength = content.name.length;
        // const baseWidth = Math.max(150, Math.min(400, textLength * 8 + 100));

        // Get background color/gradient
        let background = '#fff';
        let textColor = '#000';
        let boxShadow = 'none';
        let border = 'none';

        if (content.nodeType === 'root') {
          background = '#94ddff';
          textColor = '#000';
          boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        } else if (content.moduleIndex !== undefined) {
          background = getNodeColor(content.moduleIndex, content.nodeType);

          // ALL non-root nodes get white text
          textColor = '#FFFFFF';  // White text for modules, features, and actions

          // Module nodes get special styling
          if (content.nodeType === 'module') {
            boxShadow = '0 6px 16px rgba(0,0,0,0.25)';  // Stronger shadow
            border = '2px solid rgba(255,255,255,0.3)';  // Subtle white border
          } else {
            // Features and actions get lighter shadow
            boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          }
        }

        return `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;width:100%;padding:10px;background:${background} !important;border-radius:8px;box-shadow:${boxShadow};border:${border};color:${textColor};box-sizing:border-box;min-height:100%;">
            <div style="font-weight:bold;font-family:Arial;font-size:14px;text-align:center;word-wrap:break-word;margin-bottom:6px;color:${textColor};">${content.name}</div>
            ${content.stats ? `<div style="font-size:10px;color:${textColor === '#FFFFFF' ? 'rgba(255,255,255,0.9)' : '#666'};margin-bottom:6px;text-align:center;">${content.stats}</div>` : ''}
            <div style="display:flex;gap:8px;margin-top:4px;justify-content:center;">
              ${showEdit ? `
                <button 
                  data-node-id="${content.originalId}"
                  data-node-type="${content.nodeType}"
                  data-action="edit"
                  style="width:32px;height:32px;background:#f59e0b;border:none;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;transition:opacity 0.2s;"
                  class="tree-node-btn edit-btn"
                  title="Edit ${content.nodeType}">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354L12.427 2.487ZM11.189 6.25 9.75 4.81l-6.286 6.287a.25.25 0 0 0-.064.108l-.558 1.953 1.953-.558a.249.249 0 0 0 .108-.064l6.286-6.286Z"/>
                  </svg>
                </button>
              ` : ''}
              ${showDelete ? `
                <button 
                  data-node-id="${content.originalId}"
                  data-node-type="${content.nodeType}"
                  data-action="delete"
                  style="width:32px;height:32px;background:#ef4444;border:none;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:white;font-size:16px;transition:opacity 0.2s;"
                  class="tree-node-btn delete-btn"
                  title="Delete ${content.nodeType}">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                  </svg>
                </button>
              ` : ''}
            </div>
          </div>
        `;
      },
      nodeStyle: 'box-shadow: -3px 6px 8px -5px rgba(0,0,0,0.31)',
      canvasStyle: 'background: #fff;',
    };

    // Add event delegation for button clicks
    const handleNodeButtonClick = (e) => {
      const button = e.target.closest('[data-action]');
      if (!button) return;

      e.stopPropagation();

      const nodeId = button.dataset.nodeId;
      const nodeType = button.dataset.nodeType;
      const action = button.dataset.action;

      if (action === 'edit') {
        handleEditNode(nodeId, nodeType);
      } else if (action === 'delete') {
        handleDeleteNode(nodeId, nodeType);
      }
    };

    // Initialize and render the tree
    try {
      const tree = new ApexTree(container, options);
      tree.render(treeData);

      container.addEventListener('click', handleNodeButtonClick);

      // Alternative: Manually fit content after rendering
      setTimeout(() => {
        if (tree.fit) {
          tree.fit(); // Call fit method if available
        }
      }, 100);
    } catch (error) {

    }

    // Cleanup function
    return () => {
      if (container) {
        container.removeEventListener('click', handleNodeButtonClick);
        container.innerHTML = '';
      }
    };
  }, [data, searchTerm, isLoading, handleEditNode, handleDeleteNode]); // Updated dependencies

  // load modules on mount
  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // load features when module is selected
  useEffect(() => {
    fetchFeatures(selectedModuleId);
  }, [selectedModuleId, fetchFeatures]);

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
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 transition rounded-3xl border border-gray-300 bg-white hover:bg-gray-50 shadow-theme-xs"
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
                className="inline-flex items-center justify-center w-10 h-10 rounded-3xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reload data"
              >
                <FontAwesomeIcon
                  icon={faRotate}
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition rounded-3xl bg-success-500 hover:bg-success-600 shadow-theme-xs"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-3xl transition-all duration-200"
                  title="Clear search"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                </button>
              )}
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
              className="mx-auto min-h-[400px]"
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
              className={`
                px-4 py-2 border-2 rounded-full
                text-sm font-medium bg-white 
                hover:shadow-md hover:scale-105 transform
                focus:outline-none focus:ring-2 focus:ring-offset-2
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                w-24
              `}
              style={{
                borderColor: '#6b7280',
                color: '#6b7280',
                backgroundColor: 'white',
                minWidth: '96px'
              }}
              onMouseEnter={(e) => {
                if (!loadingSave) {
                  e.target.style.setProperty('background-color', '#f3f4f6', 'important');
                  e.target.style.setProperty('border-color', '#4b5563', 'important');
                }
              }}
              onMouseLeave={(e) => {
                if (!loadingSave) {
                  e.target.style.setProperty('background-color', 'white', 'important');
                  e.target.style.setProperty('border-color', '#6b7280', 'important');
                }
              }}
              onClick={() => setIsModalOpen(false)}
              disabled={loadingSave}
            >
              Cancel
            </button>
            <SaveButton
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

                    // Refetch modules list after creating a module
                    if (resp && resp.ok) {
                      await fetchModules();
                    }
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

                    // Refetch features list after creating a feature
                    if (resp && resp.ok && selectedModuleId) {
                      await fetchFeatures(selectedModuleId);
                    }
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
              isLoading={loadingSave}
            >
              {loadingSave ? "Saving..." : "Save"}
            </SaveButton>
          </>
        }
      >
        <div className="mb-3">
          <CustomDropdown
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: "module", label: "Module" },
              { value: "feature", label: "Feature" },
              { value: "action", label: "Action" },
            ]}
            placeholder="Select Type"
          />
        </div>

        {(type === "feature" || type === "action") && (
          <div className="mb-3">
            <CustomDropdown
              label="Module"
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              options={[
                { value: "", label: "Select module" },
                ...modulesList.map((m) => ({
                  value: m.module_id,
                  label: m.name,
                })),
              ]}
              placeholder="Select module"
            />
          </div>
        )}

        {type === "action" && (
          <div className="mb-3">
            <CustomDropdown
              label="Feature"
              value={selectedFeatureId}
              onChange={(e) => setSelectedFeatureId(e.target.value)}
              options={[
                { value: "", label: "Select feature" },
                ...featuresList.map((f) => ({
                  value: f.feature_id,
                  label: f.name,
                })),
              ]}
              placeholder="Select feature"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm mb-1">Name</label>
          <input
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="w-full rounded-lg border px-2 py-1"
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
              className={`
                px-4 py-2 border-2 rounded-full
                text-sm font-medium bg-white 
                hover:shadow-md hover:scale-105 transform
                focus:outline-none focus:ring-2 focus:ring-offset-2
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                w-24
              `}
              style={{
                borderColor: '#6b7280',
                color: '#6b7280',
                backgroundColor: 'white',
                minWidth: '96px'
              }}
              onMouseEnter={(e) => {
                if (!editLoadingSave) {
                  e.target.style.setProperty('background-color', '#f3f4f6', 'important');
                  e.target.style.setProperty('border-color', '#4b5563', 'important');
                }
              }}
              onMouseLeave={(e) => {
                if (!editLoadingSave) {
                  e.target.style.setProperty('background-color', 'white', 'important');
                  e.target.style.setProperty('border-color', '#6b7280', 'important');
                }
              }}
              onClick={() => setIsEditModalOpen(false)}
              disabled={editLoadingSave}
            >
              Cancel
            </button>
            <SaveButton
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
              isLoading={editLoadingSave}
            >
              {editLoadingSave ? "Saving..." : "Save"}
            </SaveButton>
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
                  <CustomDropdown
                    label="Module"
                    value={editSelectedModuleId}
                    onChange={(e) => setEditSelectedModuleId(e.target.value)}
                    options={[
                      { value: "", label: "Select module" },
                      ...modulesList.map((m) => ({
                        value: m.module_id,
                        label: m.name,
                      })),
                    ]}
                    placeholder="Select module"
                  />
                </div>
              )}

              {editType === "action" && (
                <div className="mb-3">
                  <CustomDropdown
                    label="Feature"
                    value={editSelectedFeatureId}
                    onChange={(e) => setEditSelectedFeatureId(e.target.value)}
                    options={[
                      { value: "", label: "Select feature" },
                      ...allFeatures.map((f) => ({
                        value: f.feature_id,
                        label: `${f.name} (${modulesList.find((m) => m.module_id === f.module_id)
                          ?.name || ""
                          })`,
                      })),
                    ]}
                    placeholder="Select feature"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm mb-1">Name</label>
                <input
                  value={editFormName}
                  onChange={(e) => setEditFormName(e.target.value)}
                  className="w-full rounded-lg border px-2 py-1"
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
