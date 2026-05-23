/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react';
import GraphCanvas from './components/GraphCanvas';
import AnalyticsPanel from './components/AnalyticsPanel';
import { presets } from './utils/presets';
import { 
  dijkstra, 
  primMST, 
  solveTSPBruteForce, 
  solveTSPDynamicProgramming
} from './utils/algorithms';
import { Navigation, Info, Terminal, ChevronUp, ChevronDown, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, BarChart3, AlertTriangle } from 'lucide-react';

export default function App() {
  const initialPresetKey = 'downtown_5';

  // --- 1. Graph State ---
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [canvasMode, setCanvasMode] = useState('select'); 
  
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [hubNodeId, setHubNodeId] = useState(null);
  const [targetNodeId, setTargetNodeId] = useState(null);
  const [activePresetKey, setActivePresetKey] = useState(initialPresetKey);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- 2. Optimization / Stepper State ---
  const [selectedAlgo, setSelectedAlgo] = useState('dijkstra');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(600); 
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [algoSteps, setAlgoSteps] = useState([]);
  const [executionLog, setExecutionLog] = useState([]);

  const [dijkstraResult, setDijkstraResult] = useState(null);
  const [primResult, setPrimResult] = useState(null);
  const [tspResult, setTspResult] = useState(null);

  const [highlightedNodes, setHighlightedNodes] = useState({});
  const [highlightedEdges, setHighlightedEdges] = useState({});

  const [toasts, setToasts] = useState([]);

  // Console drawer state
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const terminalEndRef = useRef(null);
  const terminalContainerRef = useRef(null);

  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const resetPlayback = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setHighlightedNodes({});
    setHighlightedEdges({});
    setExecutionLog([]);
  };

  const loadPreset = (key) => {
    const preset = presets[key];
    if (!preset) return;

    const clonedNodes = JSON.parse(JSON.stringify(preset.nodes));
    const clonedEdges = JSON.parse(JSON.stringify(preset.edges));

    setNodes(clonedNodes);
    setEdges(clonedEdges);

    const hubNode = clonedNodes.find(n => n.isHub);
    setHubNodeId(hubNode ? hubNode.id : clonedNodes[0]?.id || null);
    
    setSelectedNodeId(null);
    setTargetNodeId(null);
    setActivePresetKey(key);
    
    resetPlayback();
    showToast(`Loaded map preset: ${preset.name}`);
  };

  useEffect(() => {
    loadPreset(initialPresetKey);
  }, []);

  useEffect(() => {
    if (nodes.length === 0) {
      setAlgoSteps([]);
      setExecutionLog([]);
      return;
    }

    resetPlayback();

    if (selectedAlgo === 'dijkstra') {
      if (hubNodeId !== null && targetNodeId !== null) {
        const res = dijkstra(nodes, edges, hubNodeId, targetNodeId);
        setAlgoSteps(res.steps);
        setDijkstraResult({ path: res.path, distance: res.distance });
        setPrimResult(null);
        setTspResult(null);
      } else {
        setAlgoSteps([]);
        setDijkstraResult(null);
      }
    } else if (selectedAlgo === 'prim') {
      if (hubNodeId !== null) {
        const res = primMST(nodes, edges, hubNodeId);
        setAlgoSteps(res.steps);
        setPrimResult({ mstEdges: res.mstEdges, totalCost: res.totalCost });
        setDijkstraResult(null);
        setTspResult(null);
      } else {
        setAlgoSteps([]);
        setPrimResult(null);
      }
    } else if (selectedAlgo === 'tsp') {
      if (hubNodeId !== null) {
        const n = nodes.length;
        if (n > 20) {
          showToast("TSP bypassed: Network is too large (max 20 nodes).");
          setTspResult({
            brute: null,
            dp: { tour: [], expandedTour: [], cost: null, duration: 0, bypassed: true }
          });
          setDijkstraResult(null);
          setPrimResult(null);
          setAlgoSteps([
            {
              type: 'computing',
              description: `Traveling Salesman Problem bypassed. The current network has ${n} nodes, which exceeds the safe threshold of 20 nodes for Held-Karp dynamic programming.`
            }
          ]);
        } else {
          const dpRes = solveTSPDynamicProgramming(nodes, edges, hubNodeId);
          
          let bruteRes = null;
          if (n <= 10) {
            bruteRes = solveTSPBruteForce(nodes, edges, hubNodeId);
          }

          setTspResult({ brute: bruteRes, dp: dpRes });
          setDijkstraResult(null);
          setPrimResult(null);

          const isDisconnected = dpRes.cost === null;

          if (n <= 6 && bruteRes && bruteRes.steps.length > 0) {
            const tspSteps = bruteRes.steps.map((step) => ({
              type: 'search',
              tour: step.tour,
              cost: step.cost,
              bestCost: step.bestCost,
              isBetter: step.isBetter,
              evaluatedCount: step.evaluatedCount,
              description: `[Permutation Search] Checked path permutation #${step.evaluatedCount}: ${
                step.tour.map(id => nodes.find(n => n.id === id)?.label?.trim() || `Location ${id}`).join(' ➔ ')
              } (Cost: ${step.cost.toFixed(1)} km). ` +
                (step.isBetter ? `★ Found shorter delivery tour!` : `Keep searching...`)
            }));

            tspSteps.push({
              type: 'done',
              tour: dpRes.tour,
              expandedTour: dpRes.expandedTour,
              cost: dpRes.cost,
              description: `Traveling Salesman Problem complete! Side-by-side solver confirms Held-Karp DP memoization found optimal path in ${dpRes.duration} ms vs Brute Force in ${bruteRes.duration} ms.`
            });
            setAlgoSteps(tspSteps);
          } else {
            const doneDescription = isDisconnected
              ? `Traveling Salesman Problem complete: No valid circular route exists visiting all customers (the network is disconnected).`
              : `TSP optimized successfully! Held-Karp solved route visiting all ${n} customers in just ${dpRes.duration} ms (O(n² 2ⁿ)). Brute force was bypassed or timed to prevent browser lock-up.`;

            const tspSteps = [
              {
                type: 'computing',
                description: `Initiated Traveling Salesman multi-stop loop. Bypassing live permutation steps because N = ${n} is too large (would evaluate ${(n-1).toLocaleString()}! permutations). Evaluating space-time Held-Karp DP...`
              },
              {
                type: 'done',
                tour: dpRes.tour,
                expandedTour: dpRes.expandedTour,
                cost: dpRes.cost,
                description: doneDescription
              }
            ];
            setAlgoSteps(tspSteps);
          }
        }
      } else {
        setAlgoSteps([]);
        setTspResult(null);
      }
    }
  }, [nodes, edges, hubNodeId, targetNodeId, selectedAlgo]);

  useEffect(() => {
    let intervalId = null;
    if (isPlaying && algoSteps.length > 0) {
      intervalId = setInterval(() => {
        setCurrentStepIndex(prevIdx => {
          if (prevIdx < algoSteps.length - 1) {
            return prevIdx + 1;
          } else {
            setIsPlaying(false);
            showToast("Routing simulation finished!");
            return prevIdx;
          }
        });
      }, playbackSpeed);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, algoSteps, playbackSpeed]);

  useEffect(() => {
    if (algoSteps.length === 0 || currentStepIndex >= algoSteps.length) {
      setHighlightedNodes({});
      setHighlightedEdges({});
      setExecutionLog([]);
      return;
    }

    const currentStep = algoSteps[currentStepIndex];
    const newHighlightedNodes = {};
    const newHighlightedEdges = {};

    const logs = algoSteps.slice(0, currentStepIndex + 1).map(step => step.description);
    setExecutionLog(logs);

    if (selectedAlgo === 'dijkstra') {
      const { type, currentNode, neighborNode, visited, parents, highlightEdges, path } = currentStep;

      if (hubNodeId !== null) newHighlightedNodes[hubNodeId] = 'visited';
      if (targetNodeId !== null) newHighlightedNodes[targetNodeId] = 'target';

      if (visited) visited.forEach(id => newHighlightedNodes[id] = 'visited');
      if (currentNode !== null && currentNode !== undefined) newHighlightedNodes[currentNode] = 'active';
      if (neighborNode !== null && neighborNode !== undefined) newHighlightedNodes[neighborNode] = 'active';
      if (highlightEdges) highlightEdges.forEach(e => newHighlightedEdges[e.key] = 'active');

      if (parents && type !== 'done') {
        Object.entries(parents).forEach(([childId, parentId]) => {
          if (parentId !== null) {
            const edgeKey = [Math.min(childId, parentId), Math.max(childId, parentId)].join('-');
            newHighlightedEdges[edgeKey] = 'mst'; 
          }
        });
      }

      if (type === 'done' && path && path.length > 0) {
        for (let i = 0; i < path.length - 1; i++) {
          const edgeKey = [Math.min(path[i], path[i+1]), Math.max(path[i], path[i+1])].join('-');
          newHighlightedEdges[edgeKey] = 'solution';
          newHighlightedNodes[path[i]] = 'target';
        }
        newHighlightedNodes[path[path.length - 1]] = 'target';
      }

    } else if (selectedAlgo === 'prim') {
      const { type, visited, mstEdges, highlightEdges } = currentStep;

      if (visited) visited.forEach(id => newHighlightedNodes[id] = 'mst');
      if (mstEdges) {
        mstEdges.forEach(e => {
          const edgeKey = [Math.min(e.from, e.to), Math.max(e.from, e.to)].join('-');
          newHighlightedEdges[edgeKey] = 'mst';
        });
      }

      if (highlightEdges) {
        highlightEdges.forEach(e => {
          const edgeKey = [Math.min(e.from, e.to), Math.max(e.from, e.to)].join('-');
          newHighlightedEdges[edgeKey] = 'active';
          newHighlightedNodes[e.to] = 'active';
        });
      }

      if (type === 'done' && mstEdges) {
        mstEdges.forEach(e => {
          const edgeKey = [Math.min(e.from, e.to), Math.max(e.from, e.to)].join('-');
          newHighlightedEdges[edgeKey] = 'solution';
        });
        nodes.forEach(n => newHighlightedNodes[n.id] = 'target');
      }

    } else if (selectedAlgo === 'tsp') {
      const { type, tour, expandedTour } = currentStep;

      if (type === 'search' && tour) {
        for (let i = 0; i < tour.length - 1; i++) {
          const edgeKey = [Math.min(tour[i], tour[i+1]), Math.max(tour[i], tour[i+1])].join('-');
          newHighlightedEdges[edgeKey] = 'active';
        }
        tour.forEach(id => newHighlightedNodes[id] = 'active');
      } else if (type === 'done' && expandedTour) {
        for (let i = 0; i < expandedTour.length - 1; i++) {
          const edgeKey = [Math.min(expandedTour[i], expandedTour[i+1]), Math.max(expandedTour[i], expandedTour[i+1])].join('-');
          newHighlightedEdges[edgeKey] = 'solution';
        }
        expandedTour.forEach(id => newHighlightedNodes[id] = 'target');
      }
    }

    setHighlightedNodes(newHighlightedNodes);
    setHighlightedEdges(newHighlightedEdges);
  }, [currentStepIndex, algoSteps, selectedAlgo]);

  const handleStepForward = () => {
    if (currentStepIndex < algoSteps.length - 1) setCurrentStepIndex(currentStepIndex + 1);
  };

  const handleStepBackward = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
  };

  // Warning calculations
  const hasHub = hubNodeId !== null;
  const hasTarget = targetNodeId !== null;
  let warningMsg = null;
  if (selectedAlgo === 'dijkstra' && (!hasHub || !hasTarget)) {
    warningMsg = !hasHub ? "Prerequisite: Set Hub Location" : "Prerequisite: Set Destination Node";
  } else if (selectedAlgo === 'prim' && !hasHub) {
    warningMsg = "Prerequisite: Set Hub Location";
  } else if (selectedAlgo === 'tsp' && !hasHub) {
    warningMsg = "Prerequisite: Set Hub Location";
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-slate-100 flex flex-col antialiased">
      {/* 1. TOP HEADER BAR */}
      <header className="h-16 w-full border-b border-neutral-900 bg-[#050505]/95 backdrop-blur-md px-5 flex items-center justify-between shrink-0 z-30 select-none">
        {/* Left Section: Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-rose-500/10 border border-rose-500/25 p-2 rounded-xl text-rose-400">
            <Navigation className="h-5 w-5 rotate-45" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white leading-tight">
              LogiRoute
            </h1>
            <p className="text-[0.65rem] font-semibold text-neutral-500 tracking-wide mt-0.5">
              Route Optimizer Sandbox
            </p>
          </div>
        </div>

        {/* Center Section: Dropdowns & Warnings */}
        <div className="flex items-center gap-5">
          {/* Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] font-black text-neutral-500 uppercase tracking-wider">Map Grid:</span>
            <select
              value={activePresetKey}
              onChange={(e) => loadPreset(e.target.value)}
              className="bg-[#0f0f0f] border border-neutral-800 text-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-rose-500 cursor-pointer transition-all hover:bg-neutral-900"
            >
              {Object.entries(presets).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Solver Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] font-black text-neutral-500 uppercase tracking-wider">Solver:</span>
            <select
              value={selectedAlgo}
              onChange={(e) => { resetPlayback(); setSelectedAlgo(e.target.value); }}
              className="bg-[#0f0f0f] border border-neutral-800 text-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-rose-500 cursor-pointer transition-all hover:bg-neutral-900"
            >
              <option value="dijkstra">Dijkstra Shortest Path</option>
              <option value="prim">Prim's Minimum Spanning Tree</option>
              <option value="tsp">Traveling Salesman Problem</option>
            </select>
          </div>

          {/* Warning Badge */}
          {warningMsg && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[0.65rem] font-black animate-pulse">
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              <span>{warningMsg}</span>
            </div>
          )}
        </div>

        {/* Right Section: Media Controls & Toggles */}
        <div className="flex items-center gap-4">
          {/* Stepper controls */}
          <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-900 px-2 py-1 rounded-xl">
            {/* Step Backward */}
            <button
              onClick={handleStepBackward}
              disabled={isPlaying || currentStepIndex <= 0 || algoSteps.length === 0}
              className="p-1.5 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Step Backward"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={
                (selectedAlgo === 'dijkstra' && (hubNodeId === null || targetNodeId === null)) ||
                (selectedAlgo === 'prim' && hubNodeId === null) ||
                (selectedAlgo === 'tsp' && hubNodeId === null) ||
                algoSteps.length === 0
              }
              className={`px-3 py-1.5 rounded-lg text-[0.7rem] font-extrabold flex items-center gap-1 border transition-all ${
                isPlaying
                  ? 'bg-red-950/40 border-red-500/30 text-red-400 hover:bg-red-950/60 shadow-lg shadow-red-950/20'
                  : selectedAlgo === 'dijkstra'
                  ? 'bg-cyan-600 border-cyan-500 text-white hover:bg-cyan-500'
                  : selectedAlgo === 'prim'
                  ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-amber-600 border-amber-600 text-white hover:bg-amber-500'
              } disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
              {isPlaying ? 'Pause' : 'Solve'}
            </button>

            {/* Step Forward */}
            <button
              onClick={handleStepForward}
              disabled={isPlaying || currentStepIndex >= algoSteps.length - 1 || algoSteps.length === 0}
              className="p-1.5 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Step Forward"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="h-4 w-[1px] bg-neutral-900 mx-1" />

            {/* Reset */}
            <button
              onClick={resetPlayback}
              disabled={algoSteps.length === 0}
              className="p-1.5 rounded-lg hover:bg-neutral-900 text-neutral-400 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Reset Visualizer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Speed Slider */}
          <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-900 px-3 py-1.5 rounded-xl text-[0.65rem] font-bold text-neutral-500">
            <span>Speed:</span>
            <input
              type="range"
              min="200"
              max="2000"
              step="200"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="w-16 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <span className="font-mono text-neutral-400 w-8 text-right">{playbackSpeed}ms</span>
          </div>

          {/* Analytics Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-xl border transition-colors ${
              isSidebarOpen 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' 
                : 'bg-neutral-950 border-neutral-900 text-neutral-400 hover:text-white'
            }`}
            title={isSidebarOpen ? "Hide Analytics Panel" : "Show Analytics Panel"}
          >
            <BarChart3 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 2. BODY CONTAINER */}
      <div className="flex-1 w-full flex overflow-hidden relative">
        {/* CENTER FULLSCREEN CANVAS (Flex-1) */}
        <main className="flex-1 h-full relative bg-black flex flex-col overflow-hidden">
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            canvasMode={canvasMode}
            setCanvasMode={setCanvasMode}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            hubNodeId={hubNodeId}
            setHubNodeId={setHubNodeId}
            targetNodeId={targetNodeId}
            setTargetNodeId={setTargetNodeId}
            highlightedNodes={highlightedNodes}
            highlightedEdges={highlightedEdges}
            onAddNodeToast={showToast}
            selectedAlgo={selectedAlgo}
          />

          {/* Stepper Description Overlay Banner on Canvas */}
          {algoSteps.length > 0 && (
            <div className={`absolute left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-[520px] bg-[#050505]/90 backdrop-blur-md border border-neutral-900/60 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 transition-all duration-300 ${
              isConsoleOpen ? 'bottom-[300px]' : 'bottom-16'
            }`}>
              <div className={`h-2 w-2 rounded-full shrink-0 animate-pulse ${
                selectedAlgo === 'dijkstra' ? 'bg-cyan-400' : selectedAlgo === 'prim' ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className="text-xs text-neutral-300 font-bold leading-relaxed">
                {algoSteps[currentStepIndex]?.description || "Press Solve to begin simulation."}
              </span>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR (Collapsible, Width: 360px) */}
        <div className={`h-full bg-[#0a0a0a]/90 backdrop-blur-lg border-l border-neutral-900 shadow-2xl overflow-y-auto p-5 z-20 shrink-0 custom-scrollbar transition-all duration-300 ${
          isSidebarOpen ? 'w-[360px] opacity-100' : 'w-0 opacity-0 pointer-events-none p-0 border-l-0'
        }`} style={{ paddingBottom: isConsoleOpen ? 300 : 80 }}>
          {isSidebarOpen && (
            <AnalyticsPanel
              selectedAlgo={selectedAlgo}
              dijkstraResult={dijkstraResult}
              primResult={primResult}
              tspResult={tspResult}
              nodes={nodes}
              isAlgoFinished={algoSteps.length > 0 && currentStepIndex === algoSteps.length - 1}
            />
          )}
        </div>
      </div>

      {/* 4. Fixed Bottom Console Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          isConsoleOpen ? 'h-[280px]' : 'h-[44px]'
        }`}
      >
        {/* Console Header Bar */}
        <div
          className="bg-[#050505] px-5 py-2.5 border-t border-neutral-900 flex items-center justify-between cursor-pointer hover:bg-neutral-900 transition-colors select-none h-[44px]"
          onClick={() => {
            setIsConsoleOpen(!isConsoleOpen);
            if (!isConsoleOpen) {
              setTimeout(() => {
                terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, 150);
            }
          }}
        >
          <span className="flex items-center gap-2 text-xs font-black text-neutral-400 uppercase tracking-wider">
            <Terminal className="h-3.5 w-3.5 text-green-400" />
            Algorithmic Stepper Console
            {executionLog.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-black text-green-400 text-[0.65rem] font-bold border border-neutral-900">
                {executionLog.length} steps
              </span>
            )}
          </span>
          <div className="flex items-center gap-3">
            {isConsoleOpen && executionLog.length > 0 && (
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping"></span>
            )}
            {isConsoleOpen ? (
              <ChevronDown className="h-4 w-4 text-neutral-400" />
            ) : (
              <ChevronUp className="h-4 w-4 text-neutral-400" />
            )}
          </div>
        </div>

        {/* Console Body */}
        {isConsoleOpen && (
          <div
            ref={terminalContainerRef}
            className="bg-black/95 backdrop-blur-md h-[calc(100%-44px)] overflow-y-auto p-4 font-mono text-[0.75rem] text-neutral-300 flex flex-col gap-1.5 border-t border-neutral-900"
          >
            {executionLog.length === 0 ? (
              <div className="text-neutral-500 italic text-center my-auto">
                CONSOLE STANDBY — Run an optimization solver to view step-by-step operations.
              </div>
            ) : (
              executionLog.map((log, index) => (
                <div
                  key={index}
                  className="flex gap-2.5 leading-relaxed select-text py-1 border-b border-neutral-900/40 last:border-0"
                >
                  <span className="text-green-400 font-bold shrink-0 w-8 text-right">[{index + 1}]</span>
                  <span className="text-neutral-300">{log}</span>
                </div>
              ))
            )}
            <div ref={terminalEndRef}></div>
          </div>
        )}
      </div>

      {/* 5. Toast Notifications Overlay */}
      <div className={`fixed left-[20px] flex flex-col gap-2 z-50 pointer-events-none transition-all duration-300 ${isConsoleOpen ? 'bottom-[300px]' : 'bottom-16'}`}>
        {toasts.map(t => (
          <div
            key={t.id}
            className="bg-[#0d0d0d]/90 backdrop-blur-md border border-rose-500/30 text-white rounded-xl shadow-lg shadow-rose-950/20 px-4 py-3 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-bottom-5 fade-in duration-200 pointer-events-auto"
          >
            <Info className="h-4.5 w-4.5 text-rose-400 shrink-0" />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
