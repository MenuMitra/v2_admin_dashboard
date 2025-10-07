import React, { useCallback, useMemo, useEffect } from 'react';
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
  const moduleSpacing = 200;
  const featureSpacing = 150;
  const actionSpacing = 100;
  const rootToModuleSpacing = 150;

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
        minWidth: '120px'
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

    // Add features
    if (module.features && Array.isArray(module.features)) {
      module.features.forEach((feature, featureIndex) => {
        const featureNode = {
          id: `feature-${feature.feature_id}`,
          data: { label: feature.name, type: 'feature' },
          position: { 
            x: moduleNode.position.x, 
            y: moduleNode.position.y + rootToModuleSpacing + (featureIndex * featureSpacing)
          },
          style: {
            background: nodeColors.feature.background,
            color: nodeColors.feature.color,
            border: `1px solid ${nodeColors.feature.border}`,
            borderRadius: '8px',
            minWidth: '120px'
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

        // Add actions
        if (feature.actions && Array.isArray(feature.actions)) {
          feature.actions.forEach((action, actionIndex) => {
            const actionNode = {
              id: `action-${action.action_id}`,
              data: { label: action.name, type: 'action' },
              position: { 
                x: featureNode.position.x, 
                y: featureNode.position.y + rootToModuleSpacing + (actionIndex * actionSpacing)
              },
              style: {
                background: nodeColors.action.background,
                color: nodeColors.action.color,
                border: `1px solid ${nodeColors.action.border}`,
                borderRadius: '8px',
                minWidth: '120px'
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
  const { data, isLoading, error } = useUbacTree();
  
  // Transform UBAC tree data to React Flow format
  const { nodes: transformedNodes, edges: transformedEdges } = useMemo(() => {
    if (!data?.data) return { nodes: initialNodes, edges: initialEdges };
    return transformUbacTreeToReactFlow(data.data);
  }, [data]);

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

  return (
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
            
            {/* Instructions */}
            <div className="text-xs text-gray-500 border-t pt-2">
              <p>• Drag nodes to move them around</p>
              <p>• Click to select nodes or edges</p>
              <p>• Use mouse wheel to zoom</p>
              <p>• Drag background to pan</p>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

const ReactFlowDemo = () => {
  return (
    <div className="rounded-lg border border-stroke bg-white shadow-default">
      <ReactFlowProvider>
        <ReactFlowDemoInner />
      </ReactFlowProvider>
    </div>
  );
};

export default ReactFlowDemo;
