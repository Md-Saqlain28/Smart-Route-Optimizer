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
    } else if (canvasMode === 'addNode') {
      e.stopPropagation();
      setSelectedNodeId(nodeId);
    } else if (canvasMode === 'connect') {
      e.stopPropagation();
      setSelectedNodeId(nodeId); // Select node in connect mode to show details
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

  // --- Context Menu Helpers ---
  const handleSetHub = (nodeId) => {
    setNodes(prev => prev.map(n =>
      n.id === nodeId ? { ...n, isHub: true } : { ...n, isHub: false }
    ));
    setHubNodeId(nodeId);
    if (targetNodeId === nodeId) setTargetNodeId(null);
    if (onAddNodeToast) onAddNodeToast(`[${nodes.find(n => n.id === nodeId)?.label}] is now the Central Hub.`);
  };

  const handleSetTarget = (nodeId) => {
    if (nodeId === hubNodeId) {
      if (onAddNodeToast) onAddNodeToast("Hub cannot be set as destination.");
      return;
    }
    setTargetNodeId(nodeId);
    if (onAddNodeToast) onAddNodeToast(`[${nodes.find(n => n.id === nodeId)?.label}] is now the Destination.`);
  };

  const handleDeleteSelected = (nodeId) => {
    const label = nodes.find(n => n.id === nodeId)?.label;
    deleteNode(nodeId);
    if (onAddNodeToast) onAddNodeToast(`Deleted location [${label}].`);
  };

  // Compute pixel position for the floating context menu
  const getNodeScreenPos = (nodeId) => {
    if (!svgRef.current) return null;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const px = (node.x / 600) * rect.width;
    const py = (node.y / 400) * rect.height;
    return { x: px, y: py };
  };

  return (
    <div className="relative w-full h-full bg-black border border-neutral-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-black/90 backdrop-blur-md shadow-lg px-3 py-1.5 rounded-full border border-neutral-900 flex items-center gap-2 pointer-events-auto">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span className="text-sm font-semibold text-neutral-300 capitalize">
            {canvasMode === 'select' && 'Select / Drag Mode'}
            {canvasMode === 'addNode' && 'Add Locations Mode'}
            {canvasMode === 'connect' && 'Connect Roads Mode'}
            {canvasMode === 'delete' && 'Delete Mode'}
          </span>
        </div>
        
        {linkingStartId !== null && (
          <div className="bg-amber-500 text-white shadow-lg px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 animate-bounce pointer-events-auto border border-amber-400/30">
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
          className="w-full h-full cursor-crosshair select-none bg-black"
          onClick={handleCanvasClick}
          onMouseMove={handleSVGMouseMove}
          onMouseUp={handleSVGMouseUp}
          onMouseLeave={handleSVGMouseUp}
        >
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(244, 63, 94, 0.06)" strokeWidth="1" />
            </pattern>
            
            {/* Cyberpunk Neon Glow Filters */}
            <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <filter id="glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <filter id="glow-amber" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <filter id="glow-rose" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
            </filter>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#grid)" />

          {edges.map((edge, index) => {
            const nodeA = nodes.find(n => n.id === edge.from);
            const nodeB = nodes.find(n => n.id === edge.to);
            if (!nodeA || !nodeB) return null;

            const edgeKey = [Math.min(edge.from, edge.to), Math.max(edge.from, edge.to)].join('-');
            let highlightState = highlightedEdges[edgeKey];
            
            let strokeColor = "#1a1a1a"; // Charcoal-900 road edge standard
            let strokeWidth = 2.5;
            let strokeClass = "";
            let filterUrl = "";

            if (highlightState === 'active') {
              strokeWidth = 3.5;
              strokeClass = "edge-flow-processing opacity-80";
              if (selectedAlgo === 'dijkstra') { strokeColor = "#06b6d4"; filterUrl = "url(#glow-cyan)"; }
              else if (selectedAlgo === 'prim') { strokeColor = "#34d399"; filterUrl = "url(#glow-emerald)"; }
              else if (selectedAlgo === 'tsp') { strokeColor = "#fbbf24"; filterUrl = "url(#glow-amber)"; }
            } else if (highlightState === 'solution' || highlightState === 'mst') {
              strokeWidth = 4.5;
              strokeClass = "edge-flow-active";
              if (selectedAlgo === 'dijkstra') { strokeColor = "#22d3ee"; filterUrl = "url(#glow-cyan)"; }
              else if (selectedAlgo === 'prim') { strokeColor = "#05ffc4"; filterUrl = "url(#glow-emerald)"; }
              else if (selectedAlgo === 'tsp') { strokeColor = "#f59e0b"; filterUrl = "url(#glow-amber)"; }
            }

            const isClickToDelete = canvasMode === 'delete';

            return (
              <g key={`edge-${index}`} className="group cursor-pointer">
                <line
                  x1={nodeA.x} y1={nodeA.y} x2={nodeB.x} y2={nodeB.y}
                  stroke="transparent" strokeWidth="14"
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
                  filter={filterUrl}
                />
              </g>
            );
          })}

          {canvasMode === 'connect' && linkingStartId !== null && (() => {
            const startNode = nodes.find(n => n.id === linkingStartId);
            if (!startNode) return null;
            return <line x1={startNode.x} y1={startNode.y} x2={linkingStartId} stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" className="opacity-60 animate-pulse" />;
          })()}

          {nodes.map((node) => {
            const isHub = node.id === hubNodeId;
            const isTarget = node.id === targetNodeId;
            const isSelected = node.id === selectedNodeId;
            const highlightState = highlightedNodes[node.id];
            
            let nodeColorStart = "#1a1a1a"; // dark charcoal metallic
            let nodeColorEnd = "#0a0a0a";
            let strokeColor = isSelected ? "#f43f5e" : "#404040"; // rose border if selected, neutral border standard
            let strokeWidth = isSelected ? 3 : 2;
            let filterUrl = "";
            let pulseClass = "";

            // Dynamic onboarding visual guides
            const showHubGuidePulse = hubNodeId === null;
            const showTargetGuidePulse = selectedAlgo === 'dijkstra' && hubNodeId !== null && targetNodeId === null && !isHub;

            if (isHub) {
              nodeColorStart = "#f43f5e"; // glowing ruby rose
              nodeColorEnd = "#9f1239";
              strokeColor = isSelected ? "#ffffff" : "#f43f5e";
              strokeWidth = 2.5;
              filterUrl = "url(#glow-rose)";
            }

            if (highlightState === 'active') {
              if (selectedAlgo === 'dijkstra') { nodeColorStart = "#06b6d4"; nodeColorEnd = "#0891b2"; filterUrl = "url(#glow-cyan)"; }
              else if (selectedAlgo === 'prim') { nodeColorStart = "#34d399"; nodeColorEnd = "#10b981"; filterUrl = "url(#glow-emerald)"; }
              else if (selectedAlgo === 'tsp') { nodeColorStart = "#fbbf24"; nodeColorEnd = "#d97706"; filterUrl = "url(#glow-amber)"; }
              strokeColor = "#ffffff";
              pulseClass = "animate-pulse";
            } else if (highlightState === 'visited') {
              if (selectedAlgo === 'dijkstra') { nodeColorStart = "#164e63"; nodeColorEnd = "#0891b2"; strokeColor = "#22d3ee"; }
              else if (selectedAlgo === 'prim') { nodeColorStart = "#064e3b"; nodeColorEnd = "#047857"; strokeColor = "#34d399"; }
              else if (selectedAlgo === 'tsp') { nodeColorStart = "#78350f"; nodeColorEnd = "#b45309"; strokeColor = "#fbbf24"; }
            } else if (highlightState === 'target' || highlightState === 'mst') {
              if (selectedAlgo === 'dijkstra') { nodeColorStart = "#0891b2"; nodeColorEnd = "#164e63"; filterUrl = "url(#glow-cyan)"; }
              else if (selectedAlgo === 'prim') { nodeColorStart = "#10b981"; nodeColorEnd = "#065f46"; filterUrl = "url(#glow-emerald)"; }
              else if (selectedAlgo === 'tsp') { nodeColorStart = "#d97706"; nodeColorEnd = "#78350f"; filterUrl = "url(#glow-amber)"; }
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
                    stroke={selectedAlgo === 'dijkstra' ? "#22d3ee" : selectedAlgo === 'prim' ? "#05ffc4" : "#fbbf24"}
                    strokeWidth="1.5" className="animate-ping opacity-60"
                  />
                )}
                {showHubGuidePulse && (
                  <circle
                    r="19" fill="none"
                    stroke="#f43f5e"
                    strokeWidth="1.5" className="animate-pulse opacity-40"
                    strokeDasharray="3 3"
                  />
                )}
                {showTargetGuidePulse && (
                  <circle
                    r="19" fill="none"
                    stroke="#06b6d4"
                    strokeWidth="1.5" className="animate-pulse opacity-50"
                    strokeDasharray="3 3"
                  />
                )}
                <circle r="15" fill="black" opacity="0.4" dy="2" filter="url(#shadow)" />
                <circle r="14" fill={`url(#grad-${node.id})`} stroke={strokeColor} strokeWidth={strokeWidth} className="transition-all duration-300" filter={filterUrl} />
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
                  <text textAnchor="middle" dominantBaseline="middle" fill={highlightState ? "white" : "#cbd5e1"} className="text-[0.7rem] font-extrabold select-none pointer-events-none" y="0.5">
                    {node.id}
                  </text>
                )}

                <g transform={`translate(${node.labelOffsetX ?? 0}, ${node.labelOffsetY ?? 24})`}>
                  <text
                    textAnchor="middle" dominantBaseline="middle"
                    stroke="#000000" strokeWidth="4" strokeLinejoin="round"
                    className="text-[0.65rem] font-bold tracking-tight pointer-events-none" y="0"
                  >
                    {node.label}
                  </text>
                  <text
                    textAnchor="middle" dominantBaseline="middle"
                    fill={isHub ? "#fca5a5" : isTarget ? "#22d3ee" : "#a3a3a3"}
                    className={`text-[0.65rem] font-bold tracking-tight pointer-events-none ${isSelected ? 'text-rose-400 font-extrabold' : ''}`} y="0"
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
            
            let strokeColor = "#404040"; // neutral-600 road badge stroke
            let badgeStroke = "#262626";
            if (highlightState === 'active') {
              badgeStroke = selectedAlgo === 'dijkstra' ? "#06b6d4" : selectedAlgo === 'prim' ? "#34d399" : "#fbbf24";
              strokeColor = badgeStroke;
            } else if (highlightState === 'solution' || highlightState === 'mst') {
              badgeStroke = selectedAlgo === 'dijkstra' ? "#22d3ee" : selectedAlgo === 'prim' ? "#05ffc4" : "#f59e0b";
              strokeColor = badgeStroke;
            }

            const isClickToDelete = canvasMode === 'delete';

            return (
              <g key={`edge-label-${index}`} className="group cursor-pointer" transform={`translate(${(nodeA.x + nodeB.x) / 2}, ${(nodeA.y + nodeB.y) / 2})`}>
                <rect
                  x="-18" y="-10" width="36" height="20" rx="6"
                  fill="#0a0a0a" stroke={highlightState ? badgeStroke : "#262626"} strokeWidth="1.5"
                  className="shadow-md transition-all duration-300"
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
                  fill={highlightState ? strokeColor : "#a3a3a3"}
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
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-[#0a0a0a] border border-neutral-900 rounded-2xl shadow-2xl max-w-xs w-full p-5 animate-in zoom-in-95 duration-200">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5 mb-2.5">
                <Link className="h-4 w-4 text-rose-400" />
                Configure Road Weight
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                Specify delivery distance between nodes{" "}
                <strong className="text-rose-400">{nodes.find(n => n.id === edgeModal.from)?.label}</strong>{" "}
                and{" "}
                <strong className="text-rose-400">{nodes.find(n => n.id === edgeModal.to)?.label}</strong>.
              </p>
              
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <input
                    type="number" step="0.1" min="0.1" value={edgeModal.weight}
                    onChange={(e) => setEdgeModal({ ...edgeModal, weight: e.target.value })}
                    className="w-full pl-3 pr-8 py-2 bg-black border border-neutral-900 focus:border-rose-500 rounded-xl text-sm font-semibold focus:outline-none transition-all text-slate-200"
                    placeholder="E.g. 5.0" autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    km
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setEdgeModal({ isOpen: false, from: null, to: null, weight: '' })} className="flex-1 py-2 border border-neutral-900 text-neutral-300 rounded-xl text-xs font-bold hover:bg-neutral-900 hover:text-white transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveEdge} className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-950/30">
                  Confirm Road
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Context Menu on selected node */}
        {canvasMode !== 'delete' && selectedNodeId !== null && !edgeModal.isOpen && (() => {
          const pos = getNodeScreenPos(selectedNodeId);
          if (!pos) return null;
          const isHub = selectedNodeId === hubNodeId;
          const isTarget = selectedNodeId === targetNodeId;
          const node = nodes.find(n => n.id === selectedNodeId);
          return (
            <div
              className="absolute z-40 flex flex-col gap-1.5 bg-black/95 backdrop-blur-md rounded-xl shadow-2xl border border-neutral-800 p-2 animate-in fade-in zoom-in-95 duration-150"
              style={{ left: pos.x + 20, top: pos.y - 10, minWidth: 170 }}
            >
              <div className="px-2 py-0.5 text-[0.65rem] font-black text-neutral-500 uppercase tracking-wider">
                {node?.label || 'Location'} Roles
              </div>
              <div className="border-t border-neutral-900/60 my-0.5" />
              <button
                onClick={() => handleSetHub(selectedNodeId)}
                disabled={isHub}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isHub
                    ? 'text-rose-400 bg-rose-950/40 cursor-default'
                    : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <Home className="h-3.5 w-3.5 shrink-0" />
                {isHub ? 'Current Hub' : 'Set as Start Hub'}
              </button>
              <button
                onClick={() => handleSetTarget(selectedNodeId)}
                disabled={isHub || isTarget}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isTarget
                    ? 'text-cyan-400 bg-cyan-950/40 cursor-default'
                    : isHub
                    ? 'text-neutral-600 cursor-not-allowed opacity-40'
                    : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {isTarget ? 'Is Destination' : 'Set Destination'}
              </button>
              <div className="border-t border-neutral-900/60 my-0.5" />
              <button
                onClick={() => handleDeleteSelected(selectedNodeId)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all w-full text-left"
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                Delete Node
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
