import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, GitCommit, Sliders, AlertTriangle } from 'lucide-react';

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


  // Helper to check prerequisites
  const hasHub = hubNodeId !== null;
  const hasTarget = targetNodeId !== null;

  return (
    <div className="bg-[#0a0a0a]/80 border border-neutral-900 p-5 rounded-2xl shadow-xl flex flex-col gap-4">
      {/* 1. Header */}
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-2 border-b border-neutral-900/50 pb-2">
        <Sliders className="h-4 w-4 text-rose-400" />
        Select Route Solver
      </h3>

      {/* 2. Algorithm Cards */}
      <div className="flex flex-col gap-2">
        {/* CARD 1: Dijkstra */}
        <button
          onClick={() => {
            onReset();
            setSelectedAlgo('dijkstra');
          }}
          disabled={isPlaying}
          className={`group relative text-left p-3.5 rounded-xl border transition-all duration-300 ${
            selectedAlgo === 'dijkstra'
              ? 'bg-cyan-950/40 border-cyan-500/50 ring-1 ring-cyan-500/30 shadow-md shadow-cyan-950/20'
              : 'bg-black/40 border-neutral-900 hover:border-cyan-500/30 hover:bg-neutral-900/40'
          } ${isPlaying ? 'opacity-65 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center justify-between w-full">
            <span className={`text-sm font-bold flex items-center gap-1.5 ${selectedAlgo === 'dijkstra' ? 'text-cyan-300' : 'text-slate-300'}`}>
              <GitCommit className="h-4 w-4" />
              Dijkstra Route Finder
            </span>
            <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full border ${
              selectedAlgo === 'dijkstra' ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30' : 'bg-neutral-900/60 text-neutral-400 border-neutral-900'
            }`}>
              O(E log V)
            </span>
          </div>
          <p className={`text-xs mt-1.5 leading-relaxed font-medium ${selectedAlgo === 'dijkstra' ? 'text-slate-300' : 'text-neutral-500'}`}>
            Finds the absolute shortest path from the central Hub to a selected Customer. Perfect for immediate direct dispatching.
          </p>
        </button>

        {/* CARD 2: Prim */}
        <button
          onClick={() => {
            onReset();
            setSelectedAlgo('prim');
          }}
          disabled={isPlaying}
          className={`group relative text-left p-3.5 rounded-xl border transition-all duration-300 ${
            selectedAlgo === 'prim'
              ? 'bg-emerald-950/40 border-emerald-500/50 ring-1 ring-emerald-500/30 shadow-md shadow-emerald-950/20'
              : 'bg-black/40 border-neutral-900 hover:border-emerald-500/30 hover:bg-neutral-900/40'
          } ${isPlaying ? 'opacity-65 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center justify-between w-full">
            <span className={`text-sm font-bold flex items-center gap-1.5 ${selectedAlgo === 'prim' ? 'text-emerald-300' : 'text-slate-300'}`}>
              <NetworkIcon className="h-4 w-4" />
              Prim's Spanning Network
            </span>
            <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full border ${
              selectedAlgo === 'prim' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' : 'bg-neutral-900/60 text-neutral-400 border-neutral-900'
            }`}>
              O(E log V)
            </span>
          </div>
          <p className={`text-xs mt-1.5 leading-relaxed font-medium ${selectedAlgo === 'prim' ? 'text-slate-300' : 'text-neutral-500'}`}>
            Identifies the cheapest network design to connect all locations together. Saves costs on establishing highway trunks.
          </p>
        </button>

        {/* CARD 3: TSP Loop */}
        <button
          onClick={() => {
            onReset();
            setSelectedAlgo('tsp');
          }}
          disabled={isPlaying}
          className={`group relative text-left p-3.5 rounded-xl border transition-all duration-300 ${
            selectedAlgo === 'tsp'
              ? 'bg-amber-950/40 border-amber-500/50 ring-1 ring-amber-500/30 shadow-md shadow-amber-950/20'
              : 'bg-black/40 border-neutral-900 hover:border-amber-500/30 hover:bg-neutral-900/40'
          } ${isPlaying ? 'opacity-65 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center justify-between w-full">
            <span className={`text-sm font-bold flex items-center gap-1.5 ${selectedAlgo === 'tsp' ? 'text-amber-300' : 'text-slate-300'}`}>
              <LoopIcon className="h-4 w-4" />
              TSP Delivery Loop
            </span>
            <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full border ${
              selectedAlgo === 'tsp' ? 'bg-amber-950/60 text-amber-300 border-amber-500/30' : 'bg-neutral-900/60 text-neutral-400 border-neutral-900'
            }`}>
              O(N² 2ᴺ)
            </span>
          </div>
          <p className={`text-xs mt-1.5 leading-relaxed font-medium ${selectedAlgo === 'tsp' ? 'text-slate-300' : 'text-neutral-500'}`}>
            Solves the absolute best multi-stop delivery run. Starts and ends at the Hub, visiting all customer pins exactly once.
          </p>
        </button>
      </div>

      {/* 3. Prerequisite Warnings */}
      {selectedAlgo === 'dijkstra' && (!hasHub || !hasTarget) && (
        <div className="bg-amber-950/20 border border-amber-500/20 text-amber-300 p-3 rounded-xl flex gap-2 text-xs font-semibold leading-relaxed animate-pulse">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-amber-400" />
          <span>
            {!hasHub && "🏠 Depot Hub Missing: Click any location circle on the map and select 'Set as Hub' to start."}
            {hasHub && !hasTarget && "📍 Destination Missing: Click another customer pin on the map and select 'Set Destination'."}
          </span>
        </div>
      )}

      {selectedAlgo === 'prim' && !hasHub && (
        <div className="bg-amber-950/20 border border-amber-500/20 text-amber-300 p-3 rounded-xl flex gap-2 text-xs font-semibold leading-relaxed animate-pulse">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-amber-400" />
          <span>🏠 Depot Hub Missing: Click any location circle on the map and select 'Set as Hub' to establish the spanning network base.</span>
        </div>
      )}

      {selectedAlgo === 'tsp' && !hasHub && (
        <div className="bg-amber-950/20 border border-amber-500/20 text-amber-300 p-3 rounded-xl flex gap-2 text-xs font-semibold leading-relaxed animate-pulse">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-amber-400" />
          <span>🏠 Depot Hub Missing: Click any location circle on the map and select 'Set as Hub' to serve as the start/end point for the delivery loop.</span>
        </div>
      )}

      {selectedAlgo === 'tsp' && nodes.length > 10 && (
        <div className="bg-red-950/20 border border-red-500/30 text-red-300 p-3 rounded-xl flex gap-2 text-xs font-semibold leading-relaxed animate-pulse">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-400" />
          <span>⚠️ Warning: N = {nodes.length} (&gt;10 stops) is very large for Traveling Salesman. The algorithm will DP-solve dynamically, but live permutations will be bypassed.</span>
        </div>
      )}

      {/* 4. Controls & Steppers */}
      <div className="flex flex-col gap-3.5 bg-black/80 p-4 rounded-xl border border-neutral-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-neutral-500 uppercase">Solver Stepper</span>
          <span className="text-xs font-mono font-bold text-neutral-300 bg-neutral-950 border border-neutral-900 px-2 py-0.5 rounded">
            {totalSteps > 0 ? `${currentStepIndex + 1} / ${totalSteps}` : '0/0'}
          </span>
        </div>

        {/* STEP PROGRESS DESCRIPTION CARD */}
        {totalSteps > 0 && (
          <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3 flex flex-col gap-2">
            <div className="w-full bg-black h-1.5 rounded-full overflow-hidden border border-neutral-900">
              <div
                className={`h-full transition-all duration-300 ${
                  selectedAlgo === 'dijkstra' ? 'bg-cyan-500' : selectedAlgo === 'prim' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 font-semibold mt-1">
              {stepDescription || "Press play or step next to begin routing simulation."}
            </p>
          </div>
        )}

        {/* STEP PLAYBACK BUTTONS */}
        <div className="flex items-center justify-between gap-1.5">
          <button
            onClick={onStepBackward}
            disabled={isPlaying || currentStepIndex <= 0 || totalSteps === 0}
            className="p-2.5 rounded-xl border border-neutral-900 bg-neutral-950 text-neutral-300 hover:bg-neutral-900 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Step Backward"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={
              (selectedAlgo === 'dijkstra' && (!hasHub || !hasTarget)) ||
              (selectedAlgo === 'prim' && !hasHub) ||
              (selectedAlgo === 'tsp' && !hasHub) ||
              totalSteps <= 0
            }
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
              isPlaying
                ? 'bg-red-950/40 border-red-500/50 text-red-400 hover:bg-red-950/60 shadow-lg shadow-red-950/30'
                : selectedAlgo === 'dijkstra'
                ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-900/20 hover:bg-cyan-500'
                : selectedAlgo === 'prim'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500'
                : 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-900/20 hover:bg-amber-500'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4 fill-current" />
                Pause Solver
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                Solve Optimally
              </>
            )}
          </button>

          <button
            onClick={onStepForward}
            disabled={isPlaying || currentStepIndex >= totalSteps - 1 || totalSteps === 0}
            className="p-2.5 rounded-xl border border-neutral-900 bg-neutral-950 text-neutral-300 hover:bg-neutral-900 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Step Forward"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* STEPPING SPEED CONTROL */}
        <div className="flex items-center justify-between gap-2.5 mt-1 border-t border-neutral-900/60 pt-3">
          <span className="text-xs font-extrabold text-neutral-500 uppercase">Playback Speed</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="200"
              max="2000"
              step="200"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="w-20 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <span className="text-[0.65rem] font-mono font-bold text-neutral-400 w-10 text-right">
              {playbackSpeed}ms
            </span>
          </div>
        </div>

        {/* RESET STEPPER BUTTON */}
        <button
          onClick={onReset}
          disabled={totalSteps === 0}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-rose-400 bg-neutral-950 hover:bg-neutral-900 border border-neutral-900 transition-colors disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Path Visualizer
        </button>
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
