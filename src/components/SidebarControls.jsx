import { Home, Trash2, Link, MapPin, Move, PlusCircle, HelpCircle } from 'lucide-react';

export default function SidebarControls({
  nodes,
  setNodes,
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
      <div className="bg-[#0a0a0a]/80 border border-neutral-900 p-4 rounded-2xl shadow-xl">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
          <Move className="h-3.5 w-3.5 text-rose-400" />
          Canvas Work Tools
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          {/* Tool: Select/Drag */}
          <button
            onClick={() => setCanvasMode('select')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              canvasMode === 'select'
                ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-950/45'
                : 'bg-black/40 border-neutral-900 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
            }`}
          >
            <Move className="h-3.5 w-3.5 shrink-0" />
            🤚 Drag & Select
          </button>

          {/* Tool: Add Location */}
          <button
            onClick={() => setCanvasMode('addNode')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              canvasMode === 'addNode'
                ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-950/45'
                : 'bg-black/40 border-neutral-900 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5 shrink-0" />
            📍 Add Location
          </button>

          {/* Tool: Connect Roads */}
          <button
            onClick={() => setCanvasMode('connect')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              canvasMode === 'connect'
                ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-950/45'
                : 'bg-black/40 border-neutral-900 text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
            }`}
          >
            <Link className="h-3.5 w-3.5 shrink-0" />
            🛣️ Connect Roads
          </button>

          {/* Tool: Delete */}
          <button
            onClick={() => setCanvasMode('delete')}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              canvasMode === 'delete'
                ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-950/45'
                : 'bg-black/40 border-neutral-900 text-neutral-400 hover:bg-red-950/20 hover:text-red-400 hover:border-red-950/30'
            }`}
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" />
            ❌ Erase Tool
          </button>
        </div>

        {/* Dynamic Instructional Helper text */}
        <div className="mt-3.5 bg-black/40 border border-neutral-900 rounded-xl p-2.5 flex gap-2">
          <HelpCircle className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
          <p className="text-[0.7rem] leading-relaxed text-neutral-400 font-medium">
            {canvasMode === 'select' && "Click any location on the map to inspect details or assign starting Hubs / Destinations."}
            {canvasMode === 'addNode' && "Click empty grid areas on the map canvas to place new client delivery locations."}
            {canvasMode === 'connect' && "Click Location A then Location B to draw a road line between them."}
            {canvasMode === 'delete' && "Click on any location pin or road distance badge to delete it immediately."}
          </p>
        </div>
      </div>

      {/* 2. Selected Node Inspector */}
      {selectedNode ? (
        <div className="bg-[#0a0a0a]/80 border border-neutral-900 p-4 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-neutral-900/60 pb-3 mb-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              Location Inspector
            </h3>
            <span className="text-xs font-bold bg-black text-neutral-400 px-2 py-0.5 rounded-full border border-neutral-900">
              ID: {selectedNode.id}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Label Edit */}
            <div>
              <label className="block text-[0.65rem] font-bold text-neutral-500 uppercase mb-1">
                Location Name
              </label>
              <input
                type="text"
                value={selectedNode.label}
                onChange={handleLabelChange}
                className="w-full px-3 py-2 bg-black border border-neutral-900 focus:border-rose-500 rounded-xl text-sm font-semibold focus:outline-none text-slate-200 transition-all"
              />
            </div>

            {/* Dynamic Role Status Indicator */}
            <div className="mt-0.5">
              <label className="block text-[0.65rem] font-bold text-neutral-500 uppercase mb-1">
                Role Assignment
              </label>
              {selectedNode.id === hubNodeId ? (
                <div className="text-[0.7rem] font-extrabold text-rose-400 bg-rose-950/20 border border-rose-500/20 px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  🏠 Central Depot (Start Hub)
                </div>
              ) : selectedNode.id === targetNodeId ? (
                <div className="text-[0.7rem] font-extrabold text-cyan-400 bg-cyan-950/20 border border-cyan-500/20 px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-ping"></span>
                  📍 Delivery Point (Destination)
                </div>
              ) : (
                <div className="text-[0.7rem] font-semibold text-neutral-400 bg-neutral-950 border border-neutral-900 px-3 py-2 rounded-xl flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-600"></span>
                  📦 Customer Node (Eligible Stop)
                </div>
              )}
            </div>

            {/* Coordinates display */}
            <div className="flex gap-4 text-[0.65rem] font-bold text-neutral-500 bg-neutral-950 px-3 py-2 rounded-xl border border-neutral-900">
              <div>X-Coord: <span className="text-slate-200 font-extrabold">{selectedNode.x}px</span></div>
              <div>Y-Coord: <span className="text-slate-200 font-extrabold">{selectedNode.y}px</span></div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              {/* Set Hub */}
              <button
                onClick={handleSetHub}
                disabled={selectedNode.id === hubNodeId}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  selectedNode.id === hubNodeId
                    ? 'bg-rose-950/30 border-rose-500/10 text-rose-400/50 cursor-not-allowed'
                    : 'bg-black border border-neutral-900 text-neutral-300 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <Home className="h-3.5 w-3.5 shrink-0" />
                Set Start Hub
              </button>

              {/* Set Target Destination */}
              <button
                onClick={handleSetTarget}
                disabled={selectedNode.id === hubNodeId || selectedNode.id === targetNodeId}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  selectedNode.id === targetNodeId
                    ? 'bg-cyan-950/30 border-cyan-500/10 text-cyan-400/50 cursor-not-allowed'
                    : selectedNode.id === hubNodeId
                    ? 'opacity-30 bg-black border-neutral-900 text-neutral-700 cursor-not-allowed'
                    : 'bg-black border border-neutral-900 text-neutral-300 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                Set Destination
              </button>
            </div>

            {/* Delete Location */}
            <button
              onClick={handleDeleteNode}
              className="flex items-center justify-center gap-2 py-2 px-3 mt-1 rounded-xl text-xs font-bold text-red-400 bg-red-950/20 hover:bg-red-950/40 border border-red-950/30 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              Delete Location
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-black/30 border border-dashed border-neutral-800 rounded-2xl p-6 text-center shadow-inner">
          <MapPin className="h-8 w-8 text-neutral-600 mx-auto mb-2 animate-pulse-slow" />
          <p className="text-sm font-semibold text-neutral-400">
            No Location Selected
          </p>
          <p className="text-xs leading-relaxed text-neutral-500 mt-1 max-w-[180px] mx-auto">
            Click on a customer pin inside the grid to edit its labels or assign roles.
          </p>
        </div>
      )}

      {/* 3. Global Actions */}
      <div className="mt-auto pt-2">
        <button
          onClick={handleClearAll}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-neutral-400 hover:text-red-400 bg-neutral-950/50 hover:bg-red-950/20 border border-neutral-900 hover:border-red-950/40 transition-all shadow-md"
        >
          <Trash2 className="h-4 w-4" />
          Clear Canvas Network
        </button>
      </div>
    </div>
  );
}
