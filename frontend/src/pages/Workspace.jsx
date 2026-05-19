import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GraphCanvas from '../components/GraphCanvas';
import SidebarControls from '../components/SidebarControls';
import AlgorithmSelector from '../components/AlgorithmSelector';
import AnalyticsPanel from '../components/AnalyticsPanel';
import { presets } from '../utils/presets';
import { 
  dijkstra, 
  primMST, 
  solveTSPBruteForce, 
  solveTSPDynamicProgramming
} from '../utils/algorithms';
import { Navigation, Info, ArrowLeft } from 'lucide-react';

export default function Workspace() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse preset from URL query params
  const searchParams = new URLSearchParams(location.search);
  const initialPresetKey = searchParams.get('preset') || 'downtown_5';

  // --- 1. Graph State ---
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [canvasMode, setCanvasMode] = useState('select'); 
  
  // Selection references
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

  // Solved results stored for dashboard metrics
  const [dijkstraResult, setDijkstraResult] = useState(null);
  const [primResult, setPrimResult] = useState(null);
  const [tspResult, setTspResult] = useState(null);

  // Dynamic visual highlights for SVG canvas
  const [highlightedNodes, setHighlightedNodes] = useState({});
  const [highlightedEdges, setHighlightedEdges] = useState({});

  // Toast notification state
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // --- 3. Initial Scaffolding ---
  useEffect(() => {
    loadPreset(initialPresetKey);
  }, [initialPresetKey]);

  // --- 4. Preset Loader ---
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

  // --- 5. Reset Stepper ---
  const resetPlayback = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setHighlightedNodes({});
    setHighlightedEdges({});
    setExecutionLog([]);
  };

  // --- 6. Solver Step Compiler ---
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
          const tspSteps = bruteRes.steps.map((step, idx) => ({
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

  // --- 7. Playback Animation Effect ---
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

  // --- 8. Step Renderer (Canvas Highlight Compiler) ---
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
      const { type, currentNode, neighborNode, visited, distances, parents, highlightEdges, path } = currentStep;

      if (hubNodeId !== null) newHighlightedNodes[hubNodeId] = 'visited';
      if (targetNodeId !== null) newHighlightedNodes[targetNodeId] = 'target';

      if (visited) {
        visited.forEach(id => {
          newHighlightedNodes[id] = 'visited';
        });
      }

      if (currentNode !== null && currentNode !== undefined) {
        newHighlightedNodes[currentNode] = 'active';
      }

      if (neighborNode !== null && neighborNode !== undefined) {
        newHighlightedNodes[neighborNode] = 'active';
      }

      if (highlightEdges) {
        highlightEdges.forEach(e => {
          newHighlightedEdges[e.key] = 'active';
        });
      }

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

      if (visited) {
        visited.forEach(id => {
          newHighlightedNodes[id] = 'mst';
        });
      }

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
        nodes.forEach(n => {
          newHighlightedNodes[n.id] = 'target';
        });
      }

    } else if (selectedAlgo === 'tsp') {
      const { type, tour, expandedTour } = currentStep;

      if (type === 'search' && tour) {
        for (let i = 0; i < tour.length - 1; i++) {
          const edgeKey = [Math.min(tour[i], tour[i+1]), Math.max(tour[i], tour[i+1])].join('-');
          newHighlightedEdges[edgeKey] = 'active';
        }
        tour.forEach(id => {
          newHighlightedNodes[id] = 'active';
        });
      } else if (type === 'done' && expandedTour) {
        for (let i = 0; i < expandedTour.length - 1; i++) {
          const edgeKey = [Math.min(expandedTour[i], expandedTour[i+1]), Math.max(expandedTour[i], expandedTour[i+1])].join('-');
          newHighlightedEdges[edgeKey] = 'solution';
        }
        expandedTour.forEach(id => {
          newHighlightedNodes[id] = 'target';
        });
      }
    }

    setHighlightedNodes(newHighlightedNodes);
    setHighlightedEdges(newHighlightedEdges);
  }, [currentStepIndex, algoSteps, selectedAlgo]);

  // --- 9. Stepper Controls ---
  const handleStepForward = () => {
    if (currentStepIndex < algoSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col antialiased">
      {/* 1. Glassmorphism Top Navigation Header */}
      <header className="bg-white/80 backdrop-blur border-b border-red-50/50 sticky top-0 z-40 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
              title="Go back to Presets"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="bg-red-600 p-2.5 rounded-xl shadow-md shadow-red-100 flex items-center justify-center text-white">
              <Navigation className="h-6 w-6 rotate-45" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-gray-800 flex items-center gap-1.5">
                LogiRoute
                <span className="text-[0.8rem] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 tracking-wider">
                  Engine v2.0
                </span>
              </h1>
              <p className="text-sm font-semibold text-gray-400">
                Workspace: {presets[activePresetKey]?.name || 'Custom Setup'}
              </p>
            </div>
          </div>
          
          {/* Removed the red circled item (All Solvers Local pill) */}
        </div>
      </header>

      {/* 2. Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Sidebar Tools (PresetSelector removed to declutter) (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full">
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

        {/* Center: Canvas Workspace & Stepper controls (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="h-[430px] w-full">
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
            />
          </div>

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
        </div>

        {/* Right Side: Analytics and Factorial console (3 Cols) */}
        <div className="lg:col-span-3 h-full">
          <AnalyticsPanel
            nodeCount={nodes.length}
            selectedAlgo={selectedAlgo}
            dijkstraResult={dijkstraResult}
            primResult={primResult}
            tspResult={tspResult}
            executionLog={executionLog}
            nodes={nodes}
          />
        </div>
      </main>

      {/* 3. Toast Notifications Overlay */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
        {toasts.map(t => (
          <div
            key={t.id}
            className="bg-gray-900 border border-gray-800 text-white rounded-xl shadow-lg px-4 py-3 text-sm font-bold flex items-center gap-2 animate-in slide-in-from-bottom-5 fade-in duration-200"
          >
            <Info className="h-4.5 w-4.5 text-green-400 shrink-0" />
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* 4. Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-4 px-6 text-center text-[0.8rem] font-bold text-gray-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LogiRoute Engine — Applied Analysis of Greedy and NP-Hard Graph Paradigms.</span>
          <div className="flex gap-4">
            <span className="hover:text-gray-600 transition-colors cursor-pointer">Theoretical Proofs</span>
            <span className="hover:text-gray-600 transition-colors cursor-pointer">Held-Karp Space Matrix</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
