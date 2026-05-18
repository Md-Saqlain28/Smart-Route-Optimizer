import React from 'react';
import { Home, Trash2, Link, MapPin, Move, PlusCircle, HelpCircle } from 'lucide-react';

export default function SidebarControls({
  nodes,
  setNodes,
  edges,
  setEdges,
  canvasMode,
  setCanvasMode,
  selectedNodeId,
  setSelectedNodeId,
  hubNodeId,
  setHubNodeId,
  targetNodeId,
  setTargetNodeId,
  onActionToast
}) {
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Update node label
  const handleLabelChange = (e) => {
    const newLabel = e.target.value;
    setNodes(prev => prev.map(n => 
      n.id === selectedNodeId ? { ...n, label: newLabel } : n
    ));
  };

  // Set selected node as hub
  const handleSetHub = () => {
    if (selectedNodeId === null) return;
    
    // Clear other hubs, set this one
    setNodes(prev => prev.map(n => 
      n.id === selectedNodeId ? { ...n, isHub: true } : { ...n, isHub: false }
    ));
    setHubNodeId(selectedNodeId);
    
    // If it was the target, clear target (Hub cannot be target)
    if (targetNodeId === selectedNodeId) {
      setTargetNodeId(null);
    }
    
    if (onActionToast) {
      onActionToast(`[${selectedNode?.label}] is now set as the Central Hub.`);
    }
  };

  // Set selected node as Dijkstra target
  const handleSetTarget = () => {
    if (selectedNodeId === null) return;
    
    // Hub cannot be target
    if (selectedNodeId === hubNodeId) {
      if (onActionToast) {
        onActionToast("Cannot set Central Hub as the customer target.");
      }
      return;
    }

    setTargetNodeId(selectedNodeId);
    if (onActionToast) {
      onActionToast(`[${selectedNode?.label}] is now set as the Customer Destination.`);
    }
  };

  // Delete selected node
  const handleDeleteNode = () => {
    if (selectedNodeId === null) return;
    const label = selectedNode?.label;
    
    setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
    setEdges(prev => prev.filter(e => e.from !== selectedNodeId && e.to !== selectedNodeId));
    
    if (hubNodeId === selectedNodeId) setHubNodeId(null);
    if (targetNodeId === selectedNodeId) setTargetNodeId(null);
    setSelectedNodeId(null);

    if (onActionToast) {
      onActionToast(`Deleted location [${label}] and its connections.`);
    }
  };

  // Clear entire canvas
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear the entire canvas? This will delete all nodes and roads.")) {
      setNodes([]);
      setEdges([]);
      setSelectedNodeId(null);
      setHubNodeId(null);
      setTargetNodeId(null);
      
      if (onActionToast) {
        onActionToast("Canvas cleared.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Tool Selection */}
      <div className="bg-white p-4 rounded-2xl border border-green-50 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Move className="h-3.5 w-3.5 text-green-500" />
          Canvas Work Tools
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          {/* Tool: Select/Drag */}
          <button
            onClick={() => setCanvasMode('select')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              canvasMode === 'select'
                ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-100'
                : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100/70'
            }`}
          >
            <Move className="h-4 w-4 shrink-0" />
            Move / Select
          </button>

          {/* Tool: Add Location */}
          <button
            onClick={() => setCanvasMode('addNode')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              canvasMode === 'addNode'
                ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-100'
                : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100/70'
            }`}
          >
            <PlusCircle className="h-4 w-4 shrink-0" />
            Add Location
          </button>

          {/* Tool: Connect Roads */}
          <button
            onClick={() => setCanvasMode('connect')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              canvasMode === 'connect'
                ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-100'
                : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100/70'
            }`}
          >
            <Link className="h-4 w-4 shrink-0" />
            Connect Roads
          </button>

          {/* Tool: Delete */}
          <button
            onClick={() => setCanvasMode('delete')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              canvasMode === 'delete'
                ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-50'
                : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
            }`}
          >
            <Trash2 className="h-4 w-4 shrink-0" />
            Quick Erase
          </button>
        </div>

        {/* Dynamic Instructional Helper text */}
        <div className="mt-3.5 bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex gap-2">
          <HelpCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
            {canvasMode === 'select' && "Click a location to edit details. Grab and drag locations to rearrange the route topology."}
            {canvasMode === 'addNode' && "Click anywhere on the grid canvas to place a new delivery node."}
            {canvasMode === 'connect' && "Click Node A and then click Node B to draw a road. Enter custom distance weights in kilometers."}
            {canvasMode === 'delete' && "Click directly on any location or road weight badge to instantly remove it from the network."}
          </p>
        </div>
      </div>

      {/* 2. Selected Node Inspector */}
      {selectedNode ? (
        <div className="bg-white p-4 rounded-2xl border border-green-50 shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-green-500 flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              Location Inspector
            </h3>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              ID: {selectedNode.id}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Label Edit */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                Location Name
              </label>
              <input
                type="text"
                value={selectedNode.label}
                onChange={handleLabelChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-green-500 focus:bg-white text-slate-700 transition-all"
              />
            </div>

            {/* Coordinates display */}
            <div className="flex gap-4 text-[10px] font-semibold text-slate-400 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              <div>X-Coord: <span className="text-slate-600 font-bold">{selectedNode.x}px</span></div>
              <div>Y-Coord: <span className="text-slate-600 font-bold">{selectedNode.y}px</span></div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              {/* Set Hub */}
              <button
                onClick={handleSetHub}
                disabled={selectedNode.id === hubNodeId}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[10px] font-bold transition-all border ${
                  selectedNode.id === hubNodeId
                    ? 'bg-green-50 border-green-100 text-green-600 cursor-not-allowed'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-green-50 hover:text-green-600 hover:border-green-100'
                }`}
              >
                <Home className="h-3.5 w-3.5 shrink-0" />
                Set as Hub
              </button>

              {/* Set Target Destination */}
              <button
                onClick={handleSetTarget}
                disabled={selectedNode.id === hubNodeId || selectedNode.id === targetNodeId}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[10px] font-bold transition-all border ${
                  selectedNode.id === targetNodeId
                    ? 'bg-red-50 border-red-100 text-red-600 cursor-not-allowed'
                    : selectedNode.id === hubNodeId
                    ? 'opacity-40 bg-white border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                }`}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                Set Destination
              </button>
            </div>

            {/* Delete Location */}
            <button
              onClick={handleDeleteNode}
              className="flex items-center justify-center gap-2 py-2 px-3 mt-1 rounded-xl text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100/70 border border-red-100 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              Remove Location
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-green-100 rounded-2xl p-6 text-center shadow-inner">
          <MapPin className="h-8 w-8 text-slate-300 mx-auto mb-2 animate-pulse-slow" />
          <p className="text-xs font-semibold text-slate-400">
            No Location Selected
          </p>
          <p className="text-[10px] leading-relaxed text-slate-400 mt-1 max-w-[180px] mx-auto">
            Click on a customer pin inside the grid to edit its labels or assign roles.
          </p>
        </div>
      )}

      {/* 3. Global Actions */}
      <div className="mt-auto pt-2">
        <button
          onClick={handleClearAll}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50/70 border border-slate-100 hover:border-red-100 transition-all shadow-sm"
        >
          <Trash2 className="h-4 w-4" />
          Clear Canvas Network
        </button>
      </div>
    </div>
  );
}
