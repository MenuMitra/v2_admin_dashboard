import React, { useCallback } from 'react';
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

// Initial nodes representing MenuMitra entities
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
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

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
            <h3 className="text-lg font-semibold mb-2">MenuMitra Entity Relationships</h3>
            <p className="text-sm text-gray-600 mb-2">
              This diagram shows the relationships between different entities in the MenuMitra system.
            </p>
            <div className="text-xs text-gray-500">
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
