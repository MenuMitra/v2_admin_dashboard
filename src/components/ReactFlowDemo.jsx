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
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faPlus, faRotate, faMagnifyingGlass, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
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

// Custom node component for modules, features, and actions
const CustomNode = ({ data }) => {
  // Determine if delete button should be shown based on children
  const canDelete = !data.hasChildren;
  
  return (
    <div className="relative">
      {/* React Flow Handles for edge connections */}
      <Handle type="target" position={Position.Top} className="!w-2 !h-2" />
      
      {/* Node content with styling - flex layout to position buttons on right */}
      <div className="flex items-center gap-2" style={data.nodeStyle}>
        {/* Node label */}
        <span className="flex-1">{data.label}</span>
        
        {/* Action buttons container - inline on the right side */}
        <div className="flex items-center gap-1">
          {/* Edit button - warning/orange color */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              data.onEdit(data);
            }}
            title="Edit"
            className="w-8 h-8 flex items-center justify-center text-white bg-warning-500 hover:bg-warning-600 rounded-lg shadow-theme-xs transition"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" />
          </button>
          
          {/* Delete button - error/red color - only shown if no children */}
          {canDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete(data);
              }}
              title={`Delete ${data.type}`}
              className="w-8 h-8 flex items-center justify-center text-white bg-error-500 hover:bg-error-600 rounded-lg shadow-theme-xs transition"
            >
              <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2" />
    </div>
  );
};

// Transform UBAC tree data to React Flow format
const transformUbacTreeToReactFlow = (ubacData, handleEdit, handleDelete) => {
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
    const hasFeatures = module.features && Array.isArray(module.features) && module.features.length > 0;
    const moduleNode = {
      id: `module-${module.module_id}`,
      type: 'custom',
      data: { 
        label: module.name, 
        type: 'module',
        id: module.module_id,
        hasChildren: hasFeatures,
        onEdit: handleEdit,
        onDelete: handleDelete,
        nodeStyle: {
          background: nodeColors.module.background,
          color: nodeColors.module.color,
          border: `1px solid ${nodeColors.module.border}`,
          borderRadius: '8px',
          minWidth: '120px'
        }
      },
      position: { 
        x: startX + (moduleIndex * moduleSpacing), 
        y: rootToModuleSpacing 
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
            const hasActions = feature.actions && Array.isArray(feature.actions) && feature.actions.length > 0;
            const featureNode = {
              id: `feature-${feature.feature_id}`,
              type: 'custom',
              data: { 
                label: feature.name, 
                type: 'feature',
                id: feature.feature_id,
                moduleId: module.module_id,
                hasChildren: hasActions,
                onEdit: handleEdit,
                onDelete: handleDelete,
                nodeStyle: {
                  background: nodeColors.feature.background,
                  color: nodeColors.feature.color,
                  border: `1px solid ${nodeColors.feature.border}`,
                  borderRadius: '8px',
                  minWidth: '120px',
                  height: '40px'
                }
              },
              position: {
                x: featureStartX + (featureIndex * featureSpacing),
                y: moduleNode.position.y + rootToModuleSpacing
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
                  type: 'custom',
                  data: { 
                    label: action.name, 
                    type: 'action',
                    id: action.action_id,
                    moduleId: module.module_id,
                    featureId: feature.feature_id,
                    hasChildren: false, // Actions are leaf nodes, no children
                    onEdit: handleEdit,
                    onDelete: handleDelete,
                    nodeStyle: {
                      background: nodeColors.action.background,
                      color: nodeColors.action.color,
                      border: `1px solid ${nodeColors.action.border}`,
                      borderRadius: '8px',
                      minWidth: '120px',
                      height: '35px'
                    }
                  },
                  position: {
                    x: actionStartX + (actionIndex * actionSpacing),
                    y: featureNode.position.y + featureToActionSpacing
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

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editType, setEditType] = useState(""); // module | feature | action
  const [editId, setEditId] = useState("");
  const [editFormName, setEditFormName] = useState("");
  const [editSelectedModuleId, setEditSelectedModuleId] = useState("");
  const [editSelectedFeatureId, setEditSelectedFeatureId] = useState("");
  const [loadingEditSave, setLoadingEditSave] = useState(false);

  // Function to fetch modules
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
  }, [getToken, BASE_URL]);

  // Load modules on mount
  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Function to fetch features for a given module
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
  }, [getToken, BASE_URL]);

  // Load features when module is selected
  useEffect(() => {
    fetchFeatures(selectedModuleId);
  }, [selectedModuleId, fetchFeatures]);

  // Edit and delete handlers
  const handleEdit = useCallback((nodeData) => {
    setEditType(nodeData.type);
    setEditId(nodeData.id);
    setEditFormName(nodeData.label);
    // Set parent IDs if needed
    if (nodeData.moduleId) setEditSelectedModuleId(nodeData.moduleId);
    if (nodeData.featureId) setEditSelectedFeatureId(nodeData.featureId);
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (nodeData) => {
    const confirmMsg = `Delete this ${nodeData.type}? This action cannot be undone.`;
    if (!confirm(confirmMsg)) return;
    
    try {
      const token = getToken() || localStorage.getItem("token");
      const headers = { Authorization: token, "Content-Type": "application/json" };
      
      let endpoint, body;
      if (nodeData.type === 'module') {
        endpoint = '/admin/delete_modules';
        body = { module_ids: [Number(nodeData.id)] };
      } else if (nodeData.type === 'feature') {
        endpoint = '/admin/delete_features';
        body = { feature_ids: [Number(nodeData.id)] };
      } else if (nodeData.type === 'action') {
        endpoint = '/admin/delete_actions';
        body = { action_ids: [Number(nodeData.id)] };
      }
      
      const resp = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify(body)
      });
      
      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        toastController.error(errJson.detail || "Delete failed");
        return;
      }
      
      // Refetch UBAC tree
      await refetchUbacTree();
      
      // Refetch modules list if a module was deleted
      if (nodeData.type === 'module') {
        await fetchModules();
      }
      
      // Refetch features list if a feature was deleted and module is known
      if (nodeData.type === 'feature' && nodeData.moduleId) {
        await fetchFeatures(nodeData.moduleId);
      }
      
      toastController.success("Deleted successfully");
    } catch (err) {
      console.error(err);
      toastController.error("Delete failed");
    }
  }, [getToken, BASE_URL, refetchUbacTree, fetchModules, fetchFeatures]);

  // Define custom node types
  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
  }), []);
  
  // Transform UBAC tree data to React Flow format
  const { nodes: transformedNodes, edges: transformedEdges } = useMemo(() => {
    if (!data?.data) return { nodes: initialNodes, edges: initialEdges };
    const transformed = transformUbacTreeToReactFlow(data.data, handleEdit, handleDelete);
    
    // Make all nodes non-draggable initially
    const nodesWithDragDisabled = transformed.nodes.map(node => ({
      ...node,
      draggable: isDragEnabled
    }));
    
    return { nodes: nodesWithDragDisabled, edges: transformed.edges };
  }, [data, isDragEnabled, handleEdit, handleDelete]);

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
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              attributionPosition="bottom-left"
            >
        <Background />
        {/* <Controls /> */}
        {/* <MiniMap
          nodeStrokeColor={(n) => {
            if (n.style?.background) return n.style.background;
            return '#eee';
          }}
          nodeColor={(n) => {
            if (n.style?.background) return n.style.background;
            return '#fff';
          }}
          nodeBorderRadius={8}
        /> */}
       
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

                  // Refetch UBAC tree
                  await refetchUbacTree();
                  
                  // Refetch modules list if a module was created
                  if (type === "module") {
                    await fetchModules();
                  }
                  
                  // Refetch features list if a feature was created and module is selected
                  if (type === "feature" && selectedModuleId) {
                    await fetchFeatures(selectedModuleId);
                  }
                  
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

      {/* Edit Modal */}
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
              disabled={loadingEditSave}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 bg-brand-500 text-white rounded"
              onClick={async () => {
                setLoadingEditSave(true);
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
                      toastController.error("Update failed");
                      throw parseErr;
                    }
                  }

                  // Refetch UBAC tree
                  await refetchUbacTree();
                  
                  // Refetch modules list if a module was updated
                  if (editType === "module") {
                    await fetchModules();
                  }
                  
                  // Refetch features list if a feature was updated and module is selected
                  if (editType === "feature" && editSelectedModuleId) {
                    await fetchFeatures(editSelectedModuleId);
                  }
                  
                  setIsEditModalOpen(false);
                  setEditFormName("");
                  setEditSelectedFeatureId("");
                  setEditSelectedModuleId("");
                  setEditId("");
                  setEditType("");
                } catch (err) {
                  console.error(err);
                  toastController.error("Update failed");
                } finally {
                  setLoadingEditSave(false);
                }
              }}
              disabled={
                loadingEditSave ||
                (editType !== "module" && !editSelectedModuleId) ||
                (editType === "action" && !editSelectedFeatureId) ||
                !editFormName
              }
            >
              {loadingEditSave ? "Updating..." : "Update"}
            </button>
          </>
        }
      >
        <div className="mb-3">
          <label className="block text-sm mb-1">Type</label>
          <input
            value={editType}
            disabled
            className="w-full border px-2 py-1 bg-gray-100"
          />
        </div>

        {(editType === "feature" || editType === "action") && (
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
            value={editFormName}
            onChange={(e) => setEditFormName(e.target.value)}
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
