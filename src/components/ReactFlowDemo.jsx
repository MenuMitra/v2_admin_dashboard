import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faPlus, faRotate, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Breadcrumb from "./Breadcrumb";
import Modal from "./common/Modal";
import { useAuth } from "../hooks/useAuth";
import { API_CONFIG } from "../config/appConfig";
import { toastController } from "../utils/toastController";
import useUbacTree from '../lib/react-query/hooks/useUbacTree';

// Color scheme for different node types
const nodeColors = {
  root: { background: '#8b5cf6', color: 'white', border: '#7c3aed' },
  module: { background: '#f3f4f6', color: '#374151', border: '#d1d5db' },
  feature: { background: '#4ecdc4', color: 'white', border: '#26a69a' },
  action: { background: '#96ceb4', color: 'white', border: '#4caf50' }
};

// Transform UBAC tree data to React Flow format
const transformUbacTreeToReactFlow = (ubacData) => {
  if (!ubacData || !Array.isArray(ubacData)) {
    return { nodes: [], edges: [] };
  }

  const nodes = [];
  const edges = [];
  let edgeIdCounter = 1;

      // Position calculation
      const moduleSpacing = 800;
      const featureSpacing = 500;
      const actionSpacing = 400;
      const rootToModuleSpacing = 300;
      const featureToActionSpacing = 200;

  // Calculate total width needed for modules
  const totalModules = ubacData.length;
  const totalWidth = (totalModules - 1) * moduleSpacing;
  const startX = -totalWidth / 2;

  // Add UBAC TREE root node
  const rootNode = {
    id: 'ubac-root',
    type: 'input',
    data: { label: 'UBAC TREE', type: 'root' },
    position: { x: 0, y: 0 },
    style: {
      background: nodeColors.root.background,
      color: nodeColors.root.color,
      border: `2px solid ${nodeColors.root.border}`,
      borderRadius: '12px',
      minWidth: '180px',
      fontSize: '16px',
      fontWeight: 'bold'
    }
  };
  nodes.push(rootNode);

  ubacData.forEach((module, moduleIndex) => {
    // Add module node - positioned horizontally below root
    const moduleNode = {
      id: `module-${module.module_id}`,
      data: { label: module.name, type: 'module' },
      position: { 
        x: startX + (moduleIndex * moduleSpacing), 
        y: rootToModuleSpacing 
      },
       style: {
         background: nodeColors.module.background,
         color: nodeColors.module.color,
         border: `1px solid ${nodeColors.module.border}`,
         borderRadius: '8px',
         minWidth: '120px',
         paddingLeft: '15px',
         paddingRight: '15px'
       }
    };
    nodes.push(moduleNode);

    // Add edge from root to module
    edges.push({
      id: `edge-${edgeIdCounter++}`,
      source: rootNode.id,
      target: moduleNode.id,
      animated: true,
      style: { stroke: nodeColors.root.border, strokeWidth: 3 }
    });

        // Add features - spread horizontally under each module
        if (module.features && Array.isArray(module.features)) {
          const totalFeatures = module.features.length;
          const featureWidth = totalFeatures > 1 ? (totalFeatures - 1) * featureSpacing : 0;
          const featureStartX = moduleNode.position.x - featureWidth / 2;

          module.features.forEach((feature, featureIndex) => {
            const featureNode = {
              id: `feature-${feature.feature_id}`,
              data: { label: feature.name, type: 'feature' },
              position: {
                x: featureStartX + (featureIndex * featureSpacing),
                y: moduleNode.position.y + rootToModuleSpacing
              },
              style: {
                background: nodeColors.feature.background,
                color: nodeColors.feature.color,
                border: `1px solid ${nodeColors.feature.border}`,
                borderRadius: '8px',
                minWidth: '120px',
                height: '40px'
              }
            };
            nodes.push(featureNode);

            // Add module to feature edge
            edges.push({
              id: `edge-${edgeIdCounter++}`,
              source: moduleNode.id,
              target: featureNode.id,
              animated: true,
              style: { stroke: nodeColors.module.border, strokeWidth: 2 }
            });

            // Add actions - spread horizontally under each feature
            if (feature.actions && Array.isArray(feature.actions)) {
              const totalActions = feature.actions.length;
              const actionWidth = totalActions > 1 ? (totalActions - 1) * actionSpacing : 0;
              const actionStartX = featureNode.position.x - actionWidth / 2;

              feature.actions.forEach((action, actionIndex) => {
                const actionNode = {
                  id: `action-${action.action_id}`,
                  data: { label: action.name, type: 'action' },
                  position: {
                    x: actionStartX + (actionIndex * actionSpacing),
                    y: featureNode.position.y + featureToActionSpacing
                  },
                   style: {
                     background: nodeColors.action.background,
                     color: nodeColors.action.color,
                     border: `1px solid ${nodeColors.action.border}`,
                     borderRadius: '8px',
                     minWidth: '120px',
                     height: '35px',
                     paddingLeft: '10px',
                     paddingRight: '10px'
                   }
                };
                nodes.push(actionNode);

                // Add feature to action edge
                edges.push({
                  id: `edge-${edgeIdCounter++}`,
                  source: featureNode.id,
                  target: actionNode.id,
                  animated: true,
                  style: { stroke: nodeColors.feature.border, strokeWidth: 2 }
                });
              });
            }
          });
        }
  });

  return { nodes, edges };
};

// Initial nodes representing MenuMitra entities (fallback)
const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Super Owner' },
    position: { x: 250, y: 25 },
    style: {
      background: '#ff6b6b',
      color: 'white',
      border: '1px solid #ff5252',
      borderRadius: '8px',
    },
  },
  {
    id: '2',
    data: { label: 'Owner' },
    position: { x: 100, y: 125 },
    style: {
      background: '#4ecdc4',
      color: 'white',
      border: '1px solid #26a69a',
      borderRadius: '8px',
    },
  },
  {
    id: '3',
    data: { label: 'Admin' },
    position: { x: 400, y: 125 },
    style: {
      background: '#45b7d1',
      color: 'white',
      border: '1px solid #2196f3',
      borderRadius: '8px',
    },
  },
  {
    id: '4',
    data: { label: 'Outlet' },
    position: { x: 100, y: 250 },
    style: {
      background: '#96ceb4',
      color: 'white',
      border: '1px solid #4caf50',
      borderRadius: '8px',
    },
  },
  {
    id: '5',
    data: { label: 'Categories' },
    position: { x: 100, y: 375 },
    style: {
      background: '#feca57',
      color: 'white',
      border: '1px solid #ff9800',
      borderRadius: '8px',
    },
  },
  {
    id: '6',
    data: { label: 'Menu Items' },
    position: { x: 100, y: 500 },
    style: {
      background: '#ff9ff3',
      color: 'white',
      border: '1px solid #e91e63',
      borderRadius: '8px',
    },
  },
  {
    id: '7',
    data: { label: 'Customers' },
    position: { x: 400, y: 250 },
    style: {
      background: '#a8e6cf',
      color: 'white',
      border: '1px solid #8bc34a',
      borderRadius: '8px',
    },
  },
  {
    id: '8',
    data: { label: 'Bookings' },
    position: { x: 400, y: 375 },
    style: {
      background: '#ffd3a5',
      color: 'white',
      border: '1px solid #ff5722',
      borderRadius: '8px',
    },
  },
  {
    id: '9',
    data: { label: 'Subscriptions' },
    position: { x: 400, y: 500 },
    style: {
      background: '#c7ceea',
      color: 'white',
      border: '1px solid #3f51b5',
      borderRadius: '8px',
    },
  },
];

// Initial edges showing relationships
const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: { stroke: '#ff6b6b' },
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    animated: true,
    style: { stroke: '#ff6b6b' },
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    animated: true,
    style: { stroke: '#4ecdc4' },
  },
  {
    id: 'e4-5',
    source: '4',
    target: '5',
    animated: true,
    style: { stroke: '#96ceb4' },
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    animated: true,
    style: { stroke: '#feca57' },
  },
  {
    id: 'e4-7',
    source: '4',
    target: '7',
    animated: true,
    style: { stroke: '#96ceb4' },
  },
  {
    id: 'e7-8',
    source: '7',
    target: '8',
    animated: true,
    style: { stroke: '#a8e6cf' },
  },
  {
    id: 'e2-9',
    source: '2',
    target: '9',
    animated: true,
    style: { stroke: '#4ecdc4' },
  },
];

const ReactFlowDemoInner = () => {
  const { data, isLoading, error, refetchUbacTree } = useUbacTree();
  const { getToken } = useAuth();
  const { BASE_URL } = API_CONFIG;
  const [isDragEnabled, setIsDragEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState("module"); // module | feature | action
  const [modulesList, setModulesList] = useState([]);
  const [featuresList, setFeaturesList] = useState([]);
  const [formName, setFormName] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedFeatureId, setSelectedFeatureId] = useState("");
  const [loadingSave, setLoadingSave] = useState(false);

  // Load modules on mount
  useEffect(() => {
    const fetchModules = async () => {
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
  }, [getToken]);

  // Load features when module is selected
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
  }, [selectedModuleId, getToken]);
  
  // Transform UBAC tree data to React Flow format
  const { nodes: transformedNodes, edges: transformedEdges } = useMemo(() => {
    if (!data?.data) return { nodes: initialNodes, edges: initialEdges };
    const transformed = transformUbacTreeToReactFlow(data.data);
    
    // Make all nodes non-draggable initially
    const nodesWithDragDisabled = transformed.nodes.map(node => ({
      ...node,
      draggable: isDragEnabled
    }));
    
    return { nodes: nodesWithDragDisabled, edges: transformed.edges };
  }, [data, isDragEnabled]);

  const [nodes, setNodes, onNodesChange] = useNodesState(transformedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(transformedEdges);

  // Update nodes when transformed data changes
  useEffect(() => {
    setNodes(transformedNodes);
  }, [transformedNodes, setNodes]);

  // Update edges when transformed data changes  
  useEffect(() => {
    setEdges(transformedEdges);
  }, [transformedEdges, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data?.data) return { modules: 0, features: 0, actions: 0 };
    
    const modules = data.data.length;
    const features = data.data.reduce((acc, m) => acc + (m.features?.length || 0), 0);
    const actions = data.data.reduce((acc, m) => 
      acc + (m.features?.reduce((faAcc, f) => faAcc + (f.actions?.length || 0), 0) || 0), 0
    );
    
    return { modules, features, actions };
  }, [data]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{ width: '100%', height: '700px' }} className="flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading UBAC Tree...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ width: '100%', height: '700px' }} className="flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 font-semibold mb-2">Failed to load UBAC Tree</p>
          <p className="text-gray-600">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data?.data?.length) {
    return (
      <div style={{ width: '100%', height: '700px' }} className="flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <p className="text-gray-600 font-semibold mb-2">No UBAC Tree Data</p>
          <p className="text-gray-500">No modules, features, or actions found.</p>
        </div>
      </div>
    );
  }

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
                Modules: {stats.modules}
              </span>
              <span className="font-medium text-gray-800">
                Features: {stats.features}
              </span>
              <span className="font-medium text-gray-800">
                Actions: {stats.actions}
              </span>
            </div>

            {/* Right - Search */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
              </span>
              <input
                placeholder="Search modules, features, actions..."
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 h-10 w-[250px] rounded-lg border border-gray-200 bg-transparent py-2 pr-10 pl-12 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  title="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* React Flow Content */}
        <div className="px-6 pb-6">
          <div style={{ width: '100%', height: '700px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              attributionPosition="bottom-left"
            >
        <Background />
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.style?.background) return n.style.background;
            return '#eee';
          }}
          nodeColor={(n) => {
            if (n.style?.background) return n.style.background;
            return '#fff';
          }}
          nodeBorderRadius={8}
        />
        <Panel position="top-left">
          <div className="bg-white p-4 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-2">UBAC Tree Visualization</h3>
            {/* <p className="text-sm text-gray-600 mb-3">
              Interactive visualization of the User-Based Access Control tree structure.
            </p> */}
            
            {/* Statistics */}
            <div className="flex justify-center items-center gap-4 mb-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="font-semibold text-gray-800">{stats.modules}</span>
                <span className="text-gray-500">Modules</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="font-semibold text-blue-800">{stats.features}</span>
                <span className="text-blue-500">Features</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="font-semibold text-green-800">{stats.actions}</span>
                <span className="text-green-500">Actions</span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="text-xs text-gray-500 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: nodeColors.root.background, border: `1px solid ${nodeColors.root.border}` }}></div>
                <span>UBAC Tree</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: nodeColors.module.background, border: `1px solid ${nodeColors.module.border}` }}></div>
                <span>Modules</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: nodeColors.feature.background }}></div>
                <span>Features</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: nodeColors.action.background }}></div>
                <span>Actions</span>
              </div>
            </div>
            
             {/* Drag Toggle */}
             <div className="border-t pt-2 mb-2">
               <button
                 onClick={() => setIsDragEnabled(!isDragEnabled)}
                 className={`w-full px-3 py-1 text-xs rounded transition-colors ${
                   isDragEnabled 
                     ? 'bg-green-100 text-green-700 border border-green-300' 
                     : 'bg-gray-100 text-gray-700 border border-gray-300'
                 }`}
               >
                 {isDragEnabled ? '🔓 Drag Enabled' : '🔒 Drag Disabled'}
               </button>
             </div>
             
             {/* Instructions */}
             <div className="text-xs text-gray-500 border-t pt-2">
               <p>• Toggle drag to move nodes around</p>
               <p>• Click to select nodes or edges</p>
               <p>• Use mouse wheel to zoom</p>
               <p>• Drag background to pan</p>
             </div>
          </div>
            </Panel>
          </ReactFlow>
          </div>
        </div>
      </div>

      {/* Create Modal */}
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
    </>
  );
};

const ReactFlowDemo = () => {
  return (
    <ReactFlowProvider>
      <ReactFlowDemoInner />
    </ReactFlowProvider>
  );
};

export default ReactFlowDemo;
