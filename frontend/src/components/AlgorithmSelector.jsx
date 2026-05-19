import React from 'react';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Zap, GitCommit, Sliders, AlertTriangle } from 'lucide-react';

export default function AlgorithmSelector({
  selectedAlgo,
  setSelectedAlgo,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  currentStepIndex,
  totalSteps,
  stepDescription,
  onStepForward,
  onStepBackward,
  onReset,
  hubNodeId,
  targetNodeId,
  nodes
}) {
  const hubNode = nodes.find(n => n.id === hubNodeId);
  const targetNode = nodes.find(n => n.id === targetNodeId);

  // Helper to check prerequisites
  const hasHub = hubNodeId !== null;
  const hasTarget = targetNodeId !== null;

  return (
    <div className="bg-white p-4 rounded-2xl border border-red-50 shadow-sm flex flex-col gap-4">
      {/* 1. Header */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
        <Zap className="h-3.5 w-3.5 text-indigo-500" />
        Routing Optimization Solvers
      </h3>

      {/* 2. Algorithm Cards */}
      <div className="flex flex-col gap-2">
        {/* Dijkstra */}
        <button
          onClick={() => {
            onReset();
            setSelectedAlgo('dijkstra');
          }}
          className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
            selectedAlgo === 'dijkstra'
              ? 'bg-cyan-600 border-cyan-600 text-white shadow-md shadow-cyan-100'
              : 'bg-white border-gray-100 hover:bg-gray-50/70 hover:border-gray-200 text-gray-700'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-bold flex items-center gap-1.5">
              <GitCommit className="h-4 w-4" />
              Dijkstra's Single Path (Greedy)
            </span>
            <span className={`text-[0.8rem] font-bold px-2 py-0.5 rounded-full ${
              selectedAlgo === 'dijkstra' ? 'bg-white/20 text-white' : 'bg-cyan-50 text-cyan-700'
            }`}>
              O(E log V)
            </span>
          </div>
          <p className={`text-xs leading-relaxed font-medium ${selectedAlgo === 'dijkstra' ? 'text-cyan-100' : 'text-gray-500'}`}>
            Finds the absolute shortest path from the central Hub to a selected Customer. Perfect for immediate direct dispatching.
          </p>
        </button>

        {/* Prim's MST */}
        <button
          onClick={() => {
            onReset();
            setSelectedAlgo('prim');
          }}
          className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
            selectedAlgo === 'prim'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100'
              : 'bg-white border-gray-100 hover:bg-gray-50/70 hover:border-gray-200 text-gray-700'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-bold flex items-center gap-1.5">
              <NetworkIcon className="h-4 w-4" />
              Prim's Minimum Spanning Tree
            </span>
            <span className={`text-[0.8rem] font-bold px-2 py-0.5 rounded-full ${
              selectedAlgo === 'prim' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
            }`}>
              O(E log V)
            </span>
          </div>
          <p className={`text-xs leading-relaxed font-medium ${selectedAlgo === 'prim' ? 'text-emerald-100' : 'text-gray-500'}`}>
            Identifies the cheapest network design to connect all locations together. Saves costs on establishing highway trunks.
          </p>
        </button>

        {/* TSP */}
        <button
          onClick={() => {
            onReset();
            setSelectedAlgo('tsp');
          }}
          className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
            selectedAlgo === 'tsp'
              ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-100'
              : 'bg-white border-gray-100 hover:bg-gray-50/70 hover:border-gray-200 text-gray-700'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-bold flex items-center gap-1.5">
              <LoopIcon className="h-4 w-4" />
              TSP Multi-Stop Loop (NP-Hard)
            </span>
            <span className={`text-[0.8rem] font-bold px-2 py-0.5 rounded-full ${
              selectedAlgo === 'tsp' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'
            }`}>
              O(N!) vs O(N<sup>2</sup> 2<sup>N</sup>)
            </span>
          </div>
          <p className={`text-xs leading-relaxed font-medium ${selectedAlgo === 'tsp' ? 'text-amber-100' : 'text-gray-500'}`}>
            Solves the absolute best multi-stop delivery run. Starts and ends at the Hub, visiting all customer pins exactly once.
          </p>
        </button>
      </div>

      {/* 3. Warnings / Missing Prerequisites Banner */}
      {selectedAlgo === 'dijkstra' && (!hasHub || !hasTarget) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-amber-700 font-semibold">
            {!hasHub && "Prerequisite Missing: Set a Location as Hub (using the Select tool) first!"}
            {hasHub && !hasTarget && "Prerequisite Missing: Set a Location as Customer Destination first!"}
          </div>
        </div>
      )}

      {selectedAlgo === 'prim' && !hasHub && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-amber-700 font-semibold">
            Prerequisite Missing: Specify a Location as Hub first!
          </div>
        </div>
      )}

      {selectedAlgo === 'tsp' && !hasHub && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-amber-700 font-semibold">
            Prerequisite Missing: Specify a Location as Hub first!
          </div>
        </div>
      )}

      {/* 4. Playback Controls */}
      <div className="pt-2 border-t border-gray-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onStepBackward()}
              disabled={currentStepIndex <= 0 || isPlaying}
              className="p-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
              title="Previous Step"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={
                selectedAlgo === 'dijkstra' && (!hasHub || !hasTarget) ||
                (selectedAlgo === 'prim' && !hasHub) ||
                (selectedAlgo === 'tsp' && !hasHub) ||
                totalSteps <= 0
              }
              className={`p-2 rounded-xl text-white shadow-sm transition-all flex items-center justify-center ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-indigo-600 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none'
              }`}
            >
              {isPlaying ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5 fill-current" />}
            </button>

            <button
              onClick={() => onStepForward()}
              disabled={currentStepIndex >= totalSteps - 1 || isPlaying}
              className="p-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
              title="Next Step"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={onReset}
              className="p-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors"
              title="Reset Animation"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Speed Slider */}
          <div className="flex items-center gap-2 max-w-[120px] w-full">
            <Sliders className="h-3.5 w-3.5 text-gray-400" />
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              title="Adjust Step Playback Delay"
            />
            <span className="text-[0.7rem] font-bold text-gray-400 whitespace-nowrap min-w-[32px] text-right">
              {playbackSpeed}ms
            </span>
          </div>
        </div>

        {/* Step Progress & Message */}
        {totalSteps > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-gray-500">
              <span className="uppercase text-indigo-500">Solver Stepper</span>
              <span>
                Step {currentStepIndex + 1} / {totalSteps}
              </span>
            </div>
            
            {/* Step Progress Bar */}
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
              ></div>
            </div>

            {/* Stepper Description */}
            <p className="text-xs leading-relaxed text-gray-600 font-semibold mt-1">
              {stepDescription || "Press play or step next to begin routing simulation."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Small helper icon components
function NetworkIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      style={{ width: '16px', height: '16px' }}
    >
      <rect x="16" y="16" width="6" height="6" rx="1" />
      <rect x="2" y="16" width="6" height="6" rx="1" />
      <rect x="9" y="2" width="6" height="6" rx="1" />
      <path d="M12 8v8M5 16v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
    </svg>
  );
}

function LoopIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      style={{ width: '16px', height: '16px' }}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  );
}
