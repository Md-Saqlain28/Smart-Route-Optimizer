import React, { useState, useEffect, useRef } from 'react';
import GraphCanvas from './components/GraphCanvas';
import SidebarControls from './components/SidebarControls';
import PresetSelector from './components/PresetSelector';
import AlgorithmSelector from './components/AlgorithmSelector';
import AnalyticsPanel from './components/AnalyticsPanel';
import { presets } from './utils/presets';
import { 
  dijkstra, 
  primMST, 
  solveTSPBruteForce, 
  solveTSPDynamicProgramming
} from './utils/algorithms';
import { Navigation, Info, Terminal, ChevronUp, ChevronDown } from 'lucide-react';

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

  useEffect(() => {
    loadPreset(initialPresetKey);
  }, []);

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

  const resetPlayback = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setHighlightedNodes({});
    setHighlightedEdges({});
    setExecutionLog([]);
  };

  const triggerAutoDemo = () => {
    const preset = presets['downtown_5'];
    if (!preset) return;

    const clonedNodes = JSON.parse(JSON.stringify(preset.nodes));
    const clonedEdges = JSON.parse(JSON.stringify(preset.edges));

    setNodes(clonedNodes);
    setEdges(clonedEdges);

    const hubNode = clonedNodes.find(n => n.isHub);
    const chosenHubId = hubNode ? hubNode.id : clonedNodes[0]?.id || 0;
    setHubNodeId(chosenHubId);
    
    const chosenTargetId = 4; // Node 4
    setTargetNodeId(chosenTargetId);
    setSelectedNodeId(chosenTargetId); // Highlight target in inspector

    setSelectedAlgo('dijkstra');
    setActivePresetKey('downtown_5');
    
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setHighlightedNodes({});
    setHighlightedEdges({});
    setExecutionLog([]);

    setTimeout(() => {
      setIsPlaying(true);
      showToast("🚀 Starting Auto-Solve Demo: Dijkstra Route Finder!");
    }, 150);
  };

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
        const dpRes = solveTSPDynamicProgramming(nodes, edges, hubNodeId);
        
        let bruteRes = null;
        if (n <= 10) {
          bruteRes = solveTSPBruteForce(nodes, edges, hubNodeId);
        }

        setTspResult({ brute: bruteRes, dp: dpRes });
        setDijkstraResult(null);
        setPrimResult(null);

        if (n <= 6 && bruteRes && bruteRes.steps.length > 0) {
          const tspSteps = bruteRes.steps.map((step) => ({
            type: 'search',
            tour: step.tour,
            cost: step.cost,
            bestCost: step.bestCost,
            isBetter: step.isBetter,
            evaluatedCount: step.evaluatedCount,
            description: `[Permutation Search] Checked path permutation #${step.evaluatedCount}: ${
              step.tour.map(id => nodes.find(n => n.id === id)?.label).join(' ➔ ')
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
              description: `TSP optimized successfully! Held-Karp solved route visiting all ${n} customers in just ${dpRes.duration} ms (O(n² 2ⁿ)). Brute force was bypassed or timed to prevent browser lock-up.`
            }
          ];
          setAlgoSteps(tspSteps);
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

  // --- Wizard Onboarding Logic ---
  const step1_hasNodes = nodes.length > 0;
  const step2_hasHub = hubNodeId !== null;
  const step3_hasTargetOrNotRequired = selectedAlgo !== 'dijkstra' || targetNodeId !== null;
  const step4_isReady = step1_hasNodes && step2_hasHub && step3_hasTargetOrNotRequired;
  
  let wizardStep = 1;
  let wizardTitle = "Step 1: Choose a Map Network";
  let wizardDesc = "Choose a preset map from the left panel, or click 'Add Location' to draw custom delivery locations on the canvas.";
  
  if (!step1_hasNodes) {
    wizardStep = 1;
    wizardTitle = "Step 1: Create Your Map Network";
    wizardDesc = "Select a preset map from the left sidebar, or click 'Add Location' to place delivery stops on the grid canvas.";
  } else if (!step2_hasHub) {
    wizardStep = 2;
    wizardTitle = "Step 2: Assign Starting Depot (Hub)";
    wizardDesc = "Click any location circle (pin) on the map and choose 'Set Start Hub' to define the start Depot.";
  } else if (!step3_hasTargetOrNotRequired) {
    wizardStep = 3;
    wizardTitle = "Step 3: Define Customer Destination";
    wizardDesc = "Dijkstra requires a target point. Click any other location circle on the map canvas and select 'Set Destination'.";
  } else if (step4_isReady) {
    wizardStep = 4;
    wizardTitle = isPlaying ? "Simulation Running!" : "Step 4: Solve & Visualize!";
    wizardDesc = isPlaying 
      ? "Observing algorithm routes! Check step console at the bottom for detailed calculations."
      : "Topology verified! Click the glowing 'Solve Optimally' button in the solver card to see the shortest path.";
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-slate-100 flex antialiased">
      {/* 1. LEFT SIDEBAR (Fixed Width: 380px) */}
      <div className="w-[380px] h-full flex flex-col bg-[#0a0a0a]/90 backdrop-blur-lg border-r border-neutral-900 shadow-2xl z-20 shrink-0">
        <header className="p-5 border-b border-neutral-900/60 flex items-center gap-3 shrink-0">
          <div className="bg-rose-500/10 border border-rose-500/25 p-2.5 rounded-xl shadow-lg shadow-rose-950/20 flex items-center justify-center text-rose-400">
            <Navigation className="h-6 w-6 rotate-45" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              LogiRoute
            </h1>
            <p className="text-[0.75rem] font-semibold text-neutral-400 mt-0.5 tracking-wide leading-tight">
              Interactive route optimization and graph algorithm visualizer.
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 custom-scrollbar transition-all duration-300" style={{ paddingBottom: isConsoleOpen ? 300 : 80 }}>
          <PresetSelector
            activePresetKey={activePresetKey}
            onSelectPreset={loadPreset}
          />
          
          <AlgorithmSelector
            selectedAlgo={selectedAlgo}
            setSelectedAlgo={setSelectedAlgo}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            playbackSpeed={playbackSpeed}
            setPlaybackSpeed={setPlaybackSpeed}
            currentStepIndex={currentStepIndex}
            totalSteps={algoSteps.length}
            stepDescription={algoSteps[currentStepIndex]?.description || ''}
            onStepForward={handleStepForward}
            onStepBackward={handleStepBackward}
            onReset={resetPlayback}
            hubNodeId={hubNodeId}
            targetNodeId={targetNodeId}
            nodes={nodes}
          />

          <SidebarControls
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
            canvasMode={canvasMode}
            setCanvasMode={setCanvasMode}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            hubNodeId={hubNodeId}
            setHubNodeId={setHubNodeId}
            targetNodeId={targetNodeId}
            setTargetNodeId={setTargetNodeId}
            onActionToast={showToast}
          />
        </div>
      </div>

      {/* 2. CENTER CANVAS (Flex-1) */}
      <main className="flex-1 h-full relative bg-black flex flex-col overflow-hidden">
        {/* Dynamic Guided Wizard Panel */}
        <div className="p-4 border-b border-neutral-900 bg-[#070707]/90 backdrop-blur-md z-10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-lg">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0 shadow-md">
              <span className="text-xs font-black">{wizardStep}</span>
            </div>
            <div>
              <h4 className="text-xs font-black text-white flex items-center gap-2 tracking-wide">
                {wizardTitle}
                {step4_isReady && !isPlaying && (
                  <span className="text-[0.6rem] font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Ready
                  </span>
                )}
              </h4>
              <p className="text-[0.68rem] text-neutral-400 font-semibold leading-relaxed mt-0.5 max-w-xl">
                {wizardDesc}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={triggerAutoDemo}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-md shadow-rose-950/20 border border-rose-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              🚀 Auto-Solve Demo
            </button>
          </div>
        </div>

        <div className="flex-1 w-full relative min-h-0">
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            canvasMode={canvasMode}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            hubNodeId={hubNodeId}
            setHubNodeId={setHubNodeId}
            targetNodeId={targetNodeId}
            setTargetNodeId={setTargetNodeId}
            highlightedNodes={highlightedNodes}
            highlightedEdges={highlightedEdges}
            onAddNodeToast={showToast}
            selectedAlgo={selectedAlgo} // Pass this down to use semantic colors inside canvas
          />
        </div>
      </main>

      {/* 3. RIGHT SIDEBAR (Fixed Width: 350px) */}
      <div className="w-[360px] h-full bg-[#0a0a0a]/90 backdrop-blur-lg border-l border-neutral-900 shadow-2xl overflow-y-auto p-5 z-20 shrink-0 custom-scrollbar transition-all duration-300" style={{ paddingBottom: isConsoleOpen ? 300 : 80 }}>
        <AnalyticsPanel
          nodeCount={nodes.length}
          selectedAlgo={selectedAlgo}
          dijkstraResult={dijkstraResult}
          primResult={primResult}
          tspResult={tspResult}
          nodes={nodes}
          isAlgoFinished={algoSteps.length > 0 && currentStepIndex === algoSteps.length - 1}
        />
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
      <div className={`fixed left-[400px] flex flex-col gap-2 z-50 pointer-events-none transition-all duration-300 ${isConsoleOpen ? 'bottom-[300px]' : 'bottom-16'}`}>
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
