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
  highlightedNodes,
  highlightedEdges,
  onAddNodeToast,
  selectedAlgo // 'dijkstra', 'prim', 'tsp'
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

  const getSVGCoordinates = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    const y = ((e.clientY - rect.top) / rect.height) * 400;
    return { x: Math.round(x), y: Math.round(y) };
  };

  const handleCanvasClick = (e) => {
    if (e.target !== svgRef.current) return;

    if (canvasMode === 'addNode') {
      const { x, y } = getSVGCoordinates(e);
      const nextId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0;
      
      let label = `Customer ${nextId}`;
      if (nextId === 0) {
        label = "Central Hub";
      } else {
        const charCode = 64 + nextId;
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
      setSelectedNodeId(null);
      setLinkingStartId(null);
    }
  };

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
        const nodeA = nodes.find(n => n.id === linkingStartId);
        const nodeB = nodes.find(n => n.id === nodeId);
        const distance = getEuclideanDistance(nodeA, nodeB);
        
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

  const handleSaveEdge = () => {
    const weightVal = parseFloat(edgeModal.weight);
    if (isNaN(weightVal) || weightVal <= 0) return;

    const u = edgeModal.from;
    const v = edgeModal.to;
    const existingIndex = edges.findIndex(e => 
      (e.from === u && e.to === v) || (e.from === v && e.to === u)
    );

    if (existingIndex !== -1) {
      setEdges(prevEdges => prevEdges.map((e, idx) => 
        idx === existingIndex ? { ...e, weight: weightVal } : e
      ));
    } else {
      setEdges([...edges, { from: u, to: v, weight: weightVal }]);
    }

    setEdgeModal({ isOpen: false, from: null, to: null, weight: '' });
  };

  const deleteNode = (nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.from !== nodeId && e.to !== nodeId));
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
    <div className="relative w-full h-full bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-inner flex flex-col">
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-white/95 backdrop-blur shadow-sm px-3 py-1.5 rounded-full border border-indigo-50/50 flex items-center gap-2 pointer-events-auto">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span className="text-sm font-semibold text-gray-600 capitalize">
            {canvasMode === 'select' && 'Select / Drag Mode'}
            {canvasMode === 'addNode' && 'Add Locations Mode'}
            {canvasMode === 'connect' && 'Connect Roads Mode'}
            {canvasMode === 'delete' && 'Delete Mode'}
          </span>
        </div>
        
        {linkingStartId !== null && (
          <div className="bg-amber-500 text-white shadow-md px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 animate-bounce pointer-events-auto">
            <Link className="h-3.5 w-3.5" />
            Click another location to connect!
          </div>
        )}
      </div>

      <div className="flex-1 w-full relative h-full">
        <svg
          ref={svgRef}
          viewBox="0 0 600 400"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full cursor-crosshair select-none bg-gradient-to-tr from-slate-50 via-white to-slate-50"
          onClick={handleCanvasClick}
          onMouseMove={handleSVGMouseMove}
          onMouseUp={handleSVGMouseUp}
          onMouseLeave={handleSVGMouseUp}
        >
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(99, 102, 241, 0.05)" strokeWidth="1" />
            </pattern>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {edges.map((edge, index) => {
            const nodeA = nodes.find(n => n.id === edge.from);
            const nodeB = nodes.find(n => n.id === edge.to);
            if (!nodeA || !nodeB) return null;

            const edgeKey = [Math.min(edge.from, edge.to), Math.max(edge.from, edge.to)].join('-');
            let highlightState = highlightedEdges[edgeKey];
            
            let strokeColor = "#e2e8f0"; // slate-200
            let strokeWidth = 2;
            let strokeClass = "";

            if (highlightState === 'active') {
              strokeWidth = 3.5;
              strokeClass = "edge-flow-processing opacity-70";
              if (selectedAlgo === 'dijkstra') strokeColor = "#06b6d4"; // cyan-500
              else if (selectedAlgo === 'prim') strokeColor = "#34d399"; // emerald-400
              else if (selectedAlgo === 'tsp') strokeColor = "#fbbf24"; // amber-400
            } else if (highlightState === 'solution' || highlightState === 'mst') {
              strokeWidth = 4;
              strokeClass = "edge-flow-active";
              if (selectedAlgo === 'dijkstra') strokeColor = "#0891b2"; // cyan-600
              else if (selectedAlgo === 'prim') strokeColor = "#10b981"; // emerald-500
              else if (selectedAlgo === 'tsp') strokeColor = "#f59e0b"; // amber-500
            }

            const isClickToDelete = canvasMode === 'delete';

            return (
              <g key={`edge-${index}`} className="group cursor-pointer">
                <line
                  x1={nodeA.x} y1={nodeA.y} x2={nodeB.x} y2={nodeB.y}
                  stroke="transparent" strokeWidth="12"
                  onClick={(e) => {
                    if (isClickToDelete) deleteEdge(e, index);
                    else {
                      e.stopPropagation();
                      setEdgeModal({ isOpen: true, from: edge.from, to: edge.to, weight: edge.weight.toString() });
                    }
                  }}
                />
                <line
                  x1={nodeA.x} y1={nodeA.y} x2={nodeB.x} y2={nodeB.y}
                  stroke={strokeColor} strokeWidth={strokeWidth}
                  className={`transition-all duration-300 ${strokeClass}`}
                  filter={highlightState ? "url(#shadow)" : ""}
                />

              </g>
            );
          })}

          {canvasMode === 'connect' && linkingStartId !== null && (() => {
            const startNode = nodes.find(n => n.id === linkingStartId);
            if (!startNode) return null;
            return <line x1={startNode.x} y1={startNode.y} x2={linkingStartId} stroke="#818cf8" strokeWidth="2" strokeDasharray="4 4" className="opacity-60" />;
          })()}

          {nodes.map((node) => {
            const isHub = node.id === hubNodeId;
            const isTarget = node.id === targetNodeId;
            const isSelected = node.id === selectedNodeId;
            const highlightState = highlightedNodes[node.id];
            
            let nodeColorStart = "#ffffff";
            let nodeColorEnd = "#f8fafc";
            let strokeColor = isSelected ? "#6366f1" : "#cbd5e1"; // indigo-500 if selected
            let strokeWidth = isSelected ? 3 : 2.5;
            let pulseClass = "";

            if (isHub) {
              nodeColorStart = "#6366f1"; // indigo-500
              nodeColorEnd = "#4338ca"; // indigo-700
              strokeColor = isSelected ? "#ffffff" : "#a5b4fc";
              strokeWidth = 3;
            }

            if (highlightState === 'active') {
              if (selectedAlgo === 'dijkstra') { nodeColorStart = "#06b6d4"; nodeColorEnd = "#0891b2"; }
              else if (selectedAlgo === 'prim') { nodeColorStart = "#34d399"; nodeColorEnd = "#10b981"; }
              else if (selectedAlgo === 'tsp') { nodeColorStart = "#fbbf24"; nodeColorEnd = "#d97706"; }
              strokeColor = "#ffffff";
              pulseClass = "animate-pulse";
            } else if (highlightState === 'visited') {
              if (selectedAlgo === 'dijkstra') { nodeColorStart = "#cffafe"; nodeColorEnd = "#06b6d4"; strokeColor = "#a5f3fc"; }
              else if (selectedAlgo === 'prim') { nodeColorStart = "#d1fae5"; nodeColorEnd = "#10b981"; strokeColor = "#a7f3d0"; }
              else if (selectedAlgo === 'tsp') { nodeColorStart = "#fef3c7"; nodeColorEnd = "#f59e0b"; strokeColor = "#fde68a"; }
            } else if (highlightState === 'target' || highlightState === 'mst') {
              if (selectedAlgo === 'dijkstra') { nodeColorStart = "#0891b2"; nodeColorEnd = "#164e63"; }
              else if (selectedAlgo === 'prim') { nodeColorStart = "#10b981"; nodeColorEnd = "#065f46"; }
              else if (selectedAlgo === 'tsp') { nodeColorStart = "#d97706"; nodeColorEnd = "#78350f"; }
              strokeColor = "#ffffff";
              pulseClass = "animate-pulse";
            }

            return (
              <g
                key={`node-${node.id}`} transform={`translate(${node.x}, ${node.y})`}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                className="cursor-grab active:cursor-grabbing group"
              >
                {(highlightState === 'active' || pulseClass) && (
                  <circle
                    r="20" fill="none"
                    stroke={selectedAlgo === 'dijkstra' ? "#06b6d4" : selectedAlgo === 'prim' ? "#10b981" : "#f59e0b"}
                    strokeWidth="1.5" className="animate-ping opacity-60"
                  />
                )}
                <circle r="15" fill="black" opacity="0.15" dy="2" filter="url(#shadow)" />
                <circle r="14" fill={`url(#grad-${node.id})`} stroke={strokeColor} strokeWidth={strokeWidth} className="transition-all duration-300" />
                <defs>
                  <linearGradient id={`grad-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={nodeColorStart} />
                    <stop offset="100%" stopColor={nodeColorEnd} />
                  </linearGradient>
                </defs>

                {isHub ? (
                  <path d="M-5 -2 L0 -7 L5 -2 L5 5 L-5 5 Z M-2 2 L2 2 L2 5 L-2 5 Z" fill="white" transform="scale(0.9)" />
                ) : isTarget ? (
                  <circle r="4" fill="white" className="animate-pulse" />
                ) : (
                  <text textAnchor="middle" dominantBaseline="middle" fill={highlightState ? "white" : "#64748b"} className="text-[0.7rem] font-extrabold select-none pointer-events-none" y="0.5">
                    {node.id}
                  </text>
                )}

                <g transform={`translate(${node.labelOffsetX ?? 0}, ${node.labelOffsetY ?? 24})`}>
                  <text
                    textAnchor="middle" dominantBaseline="middle"
                    stroke="white" strokeWidth="3" strokeLinejoin="round"
                    className="text-[0.65rem] font-bold tracking-tight pointer-events-none" y="0"
                  >
                    {node.label}
                  </text>
                  <text
                    textAnchor="middle" dominantBaseline="middle"
                    fill={isHub ? "#4338ca" : isTarget ? "#0891b2" : "#475569"}
                    className={`text-[0.65rem] font-bold tracking-tight pointer-events-none ${isSelected ? 'text-indigo-600' : ''}`} y="0"
                  >
                    {node.label}
                  </text>
                </g>
              </g>
            );
          })}
          {/* Edge Labels (Rendered last to stay on top of nodes) */}
          {edges.map((edge, index) => {
            const nodeA = nodes.find(n => n.id === edge.from);
            const nodeB = nodes.find(n => n.id === edge.to);
            if (!nodeA || !nodeB) return null;

            const edgeKey = [Math.min(edge.from, edge.to), Math.max(edge.from, edge.to)].join('-');
            let highlightState = highlightedEdges[edgeKey];
            
            let strokeColor = "#e2e8f0";
            if (highlightState === 'active') {
              if (selectedAlgo === 'dijkstra') strokeColor = "#06b6d4";
              else if (selectedAlgo === 'prim') strokeColor = "#34d399";
              else if (selectedAlgo === 'tsp') strokeColor = "#fbbf24";
            } else if (highlightState === 'solution' || highlightState === 'mst') {
              if (selectedAlgo === 'dijkstra') strokeColor = "#0891b2";
              else if (selectedAlgo === 'prim') strokeColor = "#10b981";
              else if (selectedAlgo === 'tsp') strokeColor = "#f59e0b";
            }

            const isClickToDelete = canvasMode === 'delete';

            return (
              <g key={`edge-label-${index}`} className="group cursor-pointer" transform={`translate(${(nodeA.x + nodeB.x) / 2}, ${(nodeA.y + nodeB.y) / 2})`}>
                <rect
                  x="-18" y="-10" width="36" height="20" rx="6"
                  fill="white" stroke={highlightState ? strokeColor : "#f1f5f9"} strokeWidth="1.5"
                  className="shadow-sm transition-all duration-300"
                  onClick={(e) => {
                    if (isClickToDelete) deleteEdge(e, index);
                    else {
                      e.stopPropagation();
                      setEdgeModal({ isOpen: true, from: edge.from, to: edge.to, weight: edge.weight.toString() });
                    }
                  }}
                />
                <text
                  textAnchor="middle" dominantBaseline="middle"
                  fill={highlightState ? strokeColor : "#64748b"}
                  className="text-[0.7rem] font-bold tracking-tighter pointer-events-none" y="1"
                >
                  {edge.weight}
                </text>
                {isClickToDelete && (
                  <circle cx="0" cy="0" r="10" fill="#ef4444" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer" onClick={(e) => deleteEdge(e, index)} />
                )}
              </g>
            );
          })}
        </svg>

        {edgeModal.isOpen && (
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-xs w-full p-4 border border-indigo-100 animate-in fade-in zoom-in-95 duration-200">
              <h4 className="text-sm font-extrabold text-gray-800 flex items-center gap-1.5 mb-2">
                <Link className="h-4 w-4 text-indigo-500" />
                Configure Road Weight
              </h4>
              <p className="text-sm text-gray-500 mb-3">
                Specify delivery distance between nodes{" "}
                <strong className="text-gray-700">{nodes.find(n => n.id === edgeModal.from)?.label}</strong>{" "}
                and{" "}
                <strong className="text-gray-700">{nodes.find(n => n.id === edgeModal.to)?.label}</strong>.
              </p>
              
              <div className="flex gap-2 mb-3.5">
                <div className="relative flex-1">
                  <input
                    type="number" step="0.1" min="0.1" value={edgeModal.weight}
                    onChange={(e) => setEdgeModal({ ...edgeModal, weight: e.target.value })}
                    className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-gray-700"
                    placeholder="E.g. 5.0" autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                    km
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setEdgeModal({ isOpen: false, from: null, to: null, weight: '' })} className="flex-1 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveEdge} className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
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
