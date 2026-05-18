import React, { useState, useRef, useEffect } from 'react';
import { Home, Trash2, Link, MapPin, Eye, Play, Pause } from 'lucide-react';
import { getEuclideanDistance } from '../utils/algorithms';

export default function GraphCanvas({
  nodes,
  edges,
  setNodes,
  setEdges,
  canvasMode, // 'select', 'addNode', 'connect', 'delete'
  selectedNodeId,
  setSelectedNodeId,
  hubNodeId,
  setHubNodeId,
  targetNodeId,
  setTargetNodeId,
  // Visualization highlights passed down from App state
  highlightedNodes, // Map of nodeId -> 'active' | 'visited' | 'target' | 'mst'
  highlightedEdges, // Set or list of edge keys (e.g. '0-1') -> 'active' | 'solution' | 'mst'
  onAddNodeToast
}) {
  const svgRef = useRef(null);
  
  // Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  
  // Edge creation state
  const [linkingStartId, setLinkingStartId] = useState(null);
  
  // In-canvas modal for setting custom edge weight
  const [edgeModal, setEdgeModal] = useState({
    isOpen: false,
    from: null,
    to: null,
    weight: ''
  });

  // Calculate position in SVG space relative to client bounding box
  const getSVGCoordinates = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    // Support responsive scaling by calculating normalized coordinates inside viewBox="0 0 600 400"
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    const y = ((e.clientY - rect.top) / rect.height) * 400;
    return { x: Math.round(x), y: Math.round(y) };
  };

  // 1. Handle SVG Canvas Click (Adding nodes)
  const handleCanvasClick = (e) => {
    // If clicking directly on an SVG child element (like a node or text), skip
    if (e.target !== svgRef.current) return;

    if (canvasMode === 'addNode') {
      const { x, y } = getSVGCoordinates(e);
      
      // Generate next unused ID
      const nextId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0;
      
      // Auto-label: A, B, C, D... then Z1, Z2...
      let label = `Customer ${nextId}`;
      if (nextId === 0) {
        label = "Central Hub";
      } else {
        const charCode = 64 + nextId; // 'A' starts at 65
        if (charCode <= 90) {
          label = `Customer ${String.fromCharCode(charCode)}`;
        }
      }

      const newNode = {
        id: nextId,
        label,
        x,
        y,
        isHub: nextId === 0
      };

      setNodes([...nodes, newNode]);
      if (nextId === 0) {
        setHubNodeId(0);
      }
      
      if (onAddNodeToast) {
        onAddNodeToast(`Added node [${label}]`);
      }
      
      setSelectedNodeId(newNode.id);
    } else {
      // Clear selection if clicking empty canvas
      setSelectedNodeId(null);
      setLinkingStartId(null);
    }
  };

  // 2. Drag & Drop Handlers
  const handleNodeMouseDown = (e, nodeId) => {
    if (canvasMode === 'select') {
      e.stopPropagation();
      setDraggingNodeId(nodeId);
      setSelectedNodeId(nodeId);
    } else if (canvasMode === 'connect') {
      e.stopPropagation();
      if (linkingStartId === null) {
        setLinkingStartId(nodeId);
      } else if (linkingStartId !== nodeId) {
        // Complete the connection
        const nodeA = nodes.find(n => n.id === linkingStartId);
        const nodeB = nodes.find(n => n.id === nodeId);
        const distance = getEuclideanDistance(nodeA, nodeB);
        
        // Open modal to configure edge weight
        setEdgeModal({
          isOpen: true,
          from: linkingStartId,
          to: nodeId,
          weight: distance.toString()
        });
        setLinkingStartId(null);
      }
    } else if (canvasMode === 'delete') {
      e.stopPropagation();
      deleteNode(nodeId);
    }
  };

  const handleSVGMouseMove = (e) => {
    if (draggingNodeId !== null && canvasMode === 'select') {
      const { x, y } = getSVGCoordinates(e);
      // Constrain inside SVG viewBox
      const constrainedX = Math.max(15, Math.min(585, x));
      const constrainedY = Math.max(15, Math.min(385, y));
      
      setNodes(prevNodes => prevNodes.map(node => 
        node.id === draggingNodeId 
          ? { ...node, x: constrainedX, y: constrainedY }
          : node
      ));
    }
  };

  const handleSVGMouseUp = () => {
    setDraggingNodeId(null);
  };

  // 3. Complete edge creation from modal
  const handleSaveEdge = () => {
    const weightVal = parseFloat(edgeModal.weight);
    if (isNaN(weightVal) || weightVal <= 0) return;

    // Check if edge already exists
    const u = edgeModal.from;
    const v = edgeModal.to;
    const existingIndex = edges.findIndex(e => 
      (e.from === u && e.to === v) || (e.from === v && e.to === u)
    );

    if (existingIndex !== -1) {
      // Update weight
      setEdges(prevEdges => prevEdges.map((e, idx) => 
        idx === existingIndex ? { ...e, weight: weightVal } : e
      ));
    } else {
      // Add new edge
      setEdges([...edges, { from: u, to: v, weight: weightVal }]);
    }

    setEdgeModal({ isOpen: false, from: null, to: null, weight: '' });
  };

  // 4. Deletions
  const deleteNode = (nodeId) => {
    // Remove the node
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    // Remove any connected edges
    setEdges(prev => prev.filter(e => e.from !== nodeId && e.to !== nodeId));
    // Reset references if needed
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    if (hubNodeId === nodeId) setHubNodeId(null);
    if (targetNodeId === nodeId) setTargetNodeId(null);
    if (linkingStartId === nodeId) setLinkingStartId(null);
  };

  const deleteEdge = (e, index) => {
    e.stopPropagation();
    setEdges(prev => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="relative w-full h-full bg-slate-50 border border-green-100 rounded-2xl overflow-hidden shadow-inner flex flex-col">
      {/* Canvas Top Bar Indicator */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-white/95 backdrop-blur shadow-sm px-3 py-1.5 rounded-full border border-green-50/50 flex items-center gap-2 pointer-events-auto">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-600 capitalize">
            {canvasMode === 'select' && 'Select / Drag Mode'}
            {canvasMode === 'addNode' && 'Add Locations Mode'}
            {canvasMode === 'connect' && 'Connect Roads Mode'}
            {canvasMode === 'delete' && 'Delete Mode'}
          </span>
        </div>
        
        {/* Dynamic linking hint */}
        {linkingStartId !== null && (
          <div className="bg-amber-500 text-white shadow-md px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 animate-bounce pointer-events-auto">
            <Link className="h-3.5 w-3.5" />
            Click another location to connect!
          </div>
        )}
      </div>

      {/* SVG Canvas Area */}
      <div className="flex-1 w-full relative min-h-[300px]">
        <svg
          ref={svgRef}
          viewBox="0 0 600 400"
          className="w-full h-full cursor-crosshair select-none bg-gradient-to-tr from-green-50/20 via-white to-slate-50/20"
          onClick={handleCanvasClick}
          onMouseMove={handleSVGMouseMove}
          onMouseUp={handleSVGMouseUp}
          onMouseLeave={handleSVGMouseUp}
        >
          {/* Grid Background */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(34, 197, 94, 0.04)" strokeWidth="1" />
            </pattern>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
            </filter>
            <filter id="glow-active" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* DRAW EDGES */}
          {edges.map((edge, index) => {
            const nodeA = nodes.find(n => n.id === edge.from);
            const nodeB = nodes.find(n => n.id === edge.to);
            if (!nodeA || !nodeB) return null;

            const edgeKey = [Math.min(edge.from, edge.to), Math.max(edge.from, edge.to)].join('-');
            
            // Determine highlight state
            let highlightState = highlightedEdges[edgeKey]; // 'active' or 'solution' or 'mst' or undefined
            
            let strokeColor = "#cbd5e1"; // slate-300 (default)
            let strokeWidth = 2;
            let strokeClass = "";

            if (highlightState === 'active') {
              strokeColor = "#ef4444"; // red-500 (relaxing / processing)
              strokeWidth = 3.5;
              strokeClass = "edge-flow-processing";
            } else if (highlightState === 'solution') {
              strokeColor = "#22c55e"; // green-500 (final short path / TSP loop)
              strokeWidth = 4;
              strokeClass = "edge-flow-active";
            } else if (highlightState === 'mst') {
              strokeColor = "#22c55e"; // green-500 (MST construction)
              strokeWidth = 4;
              strokeClass = "edge-flow-active";
            }

            // Interactive element classes
            const isClickToDelete = canvasMode === 'delete';

            return (
              <g key={`edge-${index}`} className="group cursor-pointer">
                {/* Fat invisible interaction line for easier clicking */}
                <line
                  x1={nodeA.x}
                  y1={nodeA.y}
                  x2={nodeB.x}
                  y2={nodeB.y}
                  stroke="transparent"
                  strokeWidth="12"
                  onClick={(e) => {
                    if (isClickToDelete) {
                      deleteEdge(e, index);
                    } else {
                      // Let them edit weight
                      e.stopPropagation();
                      setEdgeModal({
                        isOpen: true,
                        from: edge.from,
                        to: edge.to,
                        weight: edge.weight.toString()
                      });
                    }
                  }}
                />
                
                {/* Visual Line */}
                <line
                  x1={nodeA.x}
                  y1={nodeA.y}
                  x2={nodeB.x}
                  y2={nodeB.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  className={`transition-all duration-300 ${strokeClass}`}
                  filter={highlightState ? "url(#shadow)" : ""}
                />

                {/* Weight Text Shield & Label */}
                <g transform={`translate(${(nodeA.x + nodeB.x) / 2}, ${(nodeA.y + nodeB.y) / 2})`}>
                  <rect
                    x="-18"
                    y="-10"
                    width="36"
                    height="20"
                    rx="6"
                    fill="white"
                    stroke={highlightState ? strokeColor : "#e2e8f0"}
                    strokeWidth="1.5"
                    className="shadow-sm transition-all duration-300"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={highlightState ? strokeColor : "#475569"}
                    className="text-[9px] font-bold tracking-tighter"
                    y="1"
                  >
                    {edge.weight}
                  </text>
                  
                  {/* Small red trash icon showing on hover in Delete Mode */}
                  {isClickToDelete && (
                    <circle
                      cx="0"
                      cy="0"
                      r="10"
                      fill="#ef4444"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                      onClick={(e) => deleteEdge(e, index)}
                    />
                  )}
                </g>
              </g>
            );
          })}

          {/* DYNAMIC DRAWING LINE (Preview when creating edges) */}
          {canvasMode === 'connect' && linkingStartId !== null && (() => {
            const startNode = nodes.find(n => n.id === linkingStartId);
            if (!startNode) return null;
            return (
              <line
                x1={startNode.x}
                y1={startNode.y}
                x2={linkingStartId} // placeholder, will just be a dashed guide line to canvas center if not dragging
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="opacity-60"
              />
            );
          })()}

          {/* DRAW NODES */}
          {nodes.map((node) => {
            const isHub = node.id === hubNodeId;
            const isTarget = node.id === targetNodeId;
            const isSelected = node.id === selectedNodeId;

            // Highlight state
            const highlightState = highlightedNodes[node.id]; // 'active' | 'visited' | 'target' | 'mst' | undefined
            
            let nodeFill = "bg-gradient-to-tr from-white to-slate-100"; // Default
            let nodeColorStart = "#ffffff"; // white
            let nodeColorEnd = "#f1f5f9"; // slate-100
            let strokeColor = isSelected ? "#22c55e" : "#94a3b8"; // Green if selected
            let strokeWidth = isSelected ? 3 : 2.5;
            let pulseClass = "";

            if (isHub) {
              nodeColorStart = "#16a34a"; // green-600
              nodeColorEnd = "#14532d"; // green-900
              strokeColor = isSelected ? "#ffffff" : "#4ade80"; // white selected / light green
              strokeWidth = 3;
            }

            // Overrides based on dynamic algorithmic runner state
            if (highlightState === 'active') {
              nodeColorStart = "#ef4444"; // red-500
              nodeColorEnd = "#b91c1c"; // red-700
              strokeColor = "#ffffff";
              pulseClass = "animate-pulse";
            } else if (highlightState === 'visited') {
              nodeColorStart = "#86efac"; // light green
              nodeColorEnd = "#16a34a"; // green-600
              strokeColor = "#dcfce3";
            } else if (highlightState === 'target') {
              nodeColorStart = "#ef4444"; // red-500
              nodeColorEnd = "#b91c1c"; // red-700
              strokeColor = "#ffffff";
              pulseClass = "animate-pulse";
            } else if (highlightState === 'mst') {
              nodeColorStart = "#22c55e"; // green-500
              nodeColorEnd = "#166534"; // green-800
              strokeColor = "#86efac";
            }

            return (
              <g
                key={`node-${node.id}`}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                className="cursor-grab active:cursor-grabbing group"
              >
                {/* Node outer pulse ring for active nodes */}
                {(highlightState === 'active' || pulseClass) && (
                  <circle
                    r="20"
                    fill="none"
                    stroke={highlightState === 'active' ? "#f59e0b" : "#10b981"}
                    strokeWidth="1.5"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Node Base Shadow */}
                <circle r="15" fill="black" opacity="0.15" dy="2" filter="url(#shadow)" />

                {/* Main Node Circle */}
                <circle
                  r="14"
                  fill={`url(#grad-${node.id})`}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  className="transition-all duration-300"
                />

                {/* Gradient Definition for each Node */}
                <defs>
                  <linearGradient id={`grad-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={nodeColorStart} />
                    <stop offset="100%" stopColor={nodeColorEnd} />
                  </linearGradient>
                </defs>

                {/* House/Star Icon for Hub Node */}
                {isHub ? (
                  <path
                    d="M-5 -2 L0 -7 L5 -2 L5 5 L-5 5 Z M-2 2 L2 2 L2 5 L-2 5 Z"
                    fill="white"
                    transform="scale(0.9)"
                  />
                ) : isTarget ? (
                  // Target circle
                  <circle r="4" fill="white" className="animate-pulse" />
                ) : (
                  // Node Label Lettering/Number in circle center
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={highlightState ? "white" : "#475569"}
                    className="text-[9px] font-extrabold select-none pointer-events-none"
                    y="0.5"
                  >
                    {node.id}
                  </text>
                )}

                {/* Node Outer Floating Label Text */}
                <g transform="translate(0, 24)">
                  <rect
                    x="-40"
                    y="-9"
                    width="80"
                    height="16"
                    rx="4"
                    fill="white"
                    stroke={isSelected ? strokeColor : "#f1f5f9"}
                    strokeWidth="1"
                    className="shadow-sm"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isHub ? "#14532d" : isTarget ? "#ef4444" : "#334155"}
                    className={`text-[8px] font-bold ${isSelected ? 'text-green-600' : ''}`}
                    y="-0.5"
                  >
                    {node.label}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Floating Custom Weight Editor Modal */}
        {edgeModal.isOpen && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-xs w-full p-4 border border-green-100 animate-in fade-in zoom-in-95 duration-200">
              <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 mb-2">
                <Link className="h-4 w-4 text-green-500" />
                Configure Road Weight
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Specify delivery distance between nodes{" "}
                <strong className="text-slate-700">
                  {nodes.find(n => n.id === edgeModal.from)?.label}
                </strong>{" "}
                and{" "}
                <strong className="text-slate-700">
                  {nodes.find(n => n.id === edgeModal.to)?.label}
                </strong>.
              </p>
              
              <div className="flex gap-2 mb-3.5">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={edgeModal.weight}
                    onChange={(e) => setEdgeModal({ ...edgeModal, weight: e.target.value })}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-green-500 focus:bg-white transition-all text-slate-700"
                    placeholder="E.g. 5.0"
                    autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    km
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEdgeModal({ isOpen: false, from: null, to: null, weight: '' })}
                  className="flex-1 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdge}
                  className="flex-1 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors shadow-md shadow-green-100"
                >
                  Confirm Connection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
