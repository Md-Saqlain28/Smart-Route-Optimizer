import React, { useEffect, useRef, useState } from 'react';
import { BarChart3, AlertTriangle, ShieldAlert, Cpu, Terminal, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function AnalyticsPanel({
  nodeCount,
  selectedAlgo,
  dijkstraResult,
  primResult,
  tspResult, // { brute: { tour, cost, duration, checked }, dp: { tour, cost, duration } }
  executionLog, // Array of step strings or objects
  nodes
}) {
  const terminalEndRef = useRef(null);
  const terminalTopRef = useRef(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  // Auto-scroll the activity terminal to the bottom as logs arrive
  useEffect(() => {
    if (terminalEndRef.current && executionLog.length > 0) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [executionLog]);

  const scrollToTop = () => {
    if (terminalTopRef.current) {
      terminalTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper to map node ID sequence to node label string
  const formatTour = (tourIds) => {
    if (!tourIds || tourIds.length === 0) return "No Path Available";
    return tourIds
      .map(id => nodes.find(n => n.id === id)?.label || id)
      .join(' ➔ ');
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* 1. Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 text-white p-4 rounded-2xl border border-indigo-950 shadow-md">
        <h2 className="text-sm font-extrabold flex items-center gap-2">
          <BarChart3 className="h-4.5 w-4.5 text-indigo-400" />
          Logistics Performance Analytics
        </h2>
        <p className="text-xs text-indigo-200 mt-1 font-medium leading-relaxed">
          Real-time metrics, computational complexity tracking, and algorithmic benchmarks calculated directly in your browser.
        </p>
      </div>

      {/* 2. Factoring Combinatorial Warning Banner Removed */}

      {/* 3. Metrics Comparison Grid */}
      {selectedAlgo === 'tsp' && tspResult && (
        <div className="bg-white p-4 rounded-2xl border border-amber-50 shadow-sm flex flex-col gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
            <Cpu className="h-4.5 w-4.5 text-amber-500" />
            TSP Solver Side-by-Side Comparison
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Approach A: Brute Force */}
            <div className="bg-white border border-gray-100 p-3 rounded-xl flex flex-col gap-2">
              <span className="text-xs font-black text-gray-400 uppercase tracking-wide">
                Approach A: Brute Force
              </span>
              
              <div className="flex flex-col">
                <span className="text-[0.7rem] font-bold text-gray-400">Total Distance</span>
                <span className="text-sm font-black text-gray-700">
                  {tspResult.brute?.cost ? `${tspResult.brute.cost} km` : 'N/A (Capped)'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[0.7rem] font-bold text-gray-400">Execution Time</span>
                <span className={`text-sm font-black ${tspResult.brute?.duration > 100 ? 'text-amber-600' : 'text-gray-600'}`}>
                  {tspResult.brute?.duration !== undefined ? `${tspResult.brute.duration} ms` : 'Blocked (> 10 Nodes)'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[0.7rem] font-bold text-gray-400">Complexity</span>
                <span className="text-[0.7rem] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 w-fit mt-0.5">
                  O(n!) Factorial
                </span>
              </div>
              
              {tspResult.brute?.permutationsChecked && (
                <div className="text-[0.7rem] text-gray-400 font-bold border-t border-gray-200/50 pt-1.5 mt-1">
                  Evaluated: {tspResult.brute.permutationsChecked.toLocaleString()} paths
                </div>
              )}
            </div>

            {/* Approach B: Dynamic Programming */}
            <div className="bg-amber-50/30 border border-amber-100/50 p-3 rounded-xl flex flex-col gap-2">
              <span className="text-xs font-black text-amber-600 uppercase tracking-wide">
                Approach B: Held-Karp DP
              </span>
              
              <div className="flex flex-col">
                <span className="text-[0.7rem] font-bold text-gray-400">Total Distance</span>
                <span className="text-sm font-black text-amber-700">
                  {tspResult.dp?.cost ? `${tspResult.dp.cost} km` : 'N/A'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[0.7rem] font-bold text-gray-400">Execution Time</span>
                <span className="text-sm font-black text-emerald-600">
                  {tspResult.dp?.duration !== undefined ? `${tspResult.dp.duration} ms` : 'N/A'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[0.7rem] font-bold text-gray-400">Complexity</span>
                <span className="text-[0.7rem] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 w-fit mt-0.5">
                  O(n<sup>2</sup> &middot; 2<sup>n</sup>) Expo
                </span>
              </div>

              <div className="text-[0.7rem] text-emerald-500 font-bold border-t border-amber-100/40 pt-1.5 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Solved via Memoization
              </div>
            </div>
          </div>

          {/* Tour Sequence Display */}
          <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col gap-1 mt-1">
            <span className="text-[0.7rem] font-black text-gray-400 uppercase tracking-wide">
              Optimized Delivery Loop Sequence
            </span>
            <p className="text-xs leading-relaxed text-gray-700 font-extrabold break-words">
              {formatTour(tspResult.dp?.tour)}
            </p>
          </div>
        </div>
      )}

      {selectedAlgo === 'dijkstra' && dijkstraResult && (
        <div className="bg-white p-4 rounded-2xl border border-cyan-50 shadow-sm flex flex-col gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
            <CheckCircle2 className="h-4.5 w-4.5 text-cyan-500" />
            Dijkstra Shortest Path Result
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-100 p-3 rounded-xl flex flex-col">
              <span className="text-[0.7rem] font-bold text-gray-400">Shortest Distance</span>
              <span className="text-sm font-black text-gray-700">
                {dijkstraResult.distance !== null && dijkstraResult.distance !== Infinity 
                  ? `${dijkstraResult.distance} km` 
                  : 'Unreachable'}
              </span>
            </div>

            <div className="bg-white border border-gray-100 p-3 rounded-xl flex flex-col">
              <span className="text-[0.7rem] font-bold text-gray-400">Greedy Complexity</span>
              <span className="text-xs font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-100 w-fit mt-0.5">
                O(E log V)
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[0.7rem] font-black text-gray-400 uppercase tracking-wide">
              Shortest Routing Path
            </span>
            <p className="text-xs leading-relaxed text-gray-700 font-extrabold break-words">
              {formatTour(dijkstraResult.path)}
            </p>
          </div>
        </div>
      )}

      {selectedAlgo === 'prim' && primResult && (
        <div className="bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm flex flex-col gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 border-b border-gray-100 pb-2.5">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
            Prim's Spanning Network Result
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-100 p-3 rounded-xl flex flex-col">
              <span className="text-[0.7rem] font-bold text-gray-400">Total MST Network Cost</span>
              <span className="text-sm font-black text-gray-700">
                {primResult.totalCost !== undefined ? `${primResult.totalCost.toFixed(1)} km` : 'N/A'}
              </span>
            </div>

            <div className="bg-white border border-gray-100 p-3 rounded-xl flex flex-col">
              <span className="text-[0.7rem] font-bold text-gray-400">MST Complexity</span>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 w-fit mt-0.5">
                O(E log V)
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[0.7rem] font-black text-gray-400 uppercase tracking-wide">
              MST Road Link Count
            </span>
            <p className="text-xs leading-relaxed text-gray-700 font-extrabold break-words">
              Connected {nodes.length} nodes using {primResult.mstEdges?.length || 0} highway links.
            </p>
          </div>

          {/* Separate Output Graph for Prim's Result */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 mt-2 shadow-inner h-[200px] flex items-center justify-center relative overflow-hidden">
            <span className="absolute top-2 left-3 text-[0.65rem] font-extrabold text-gray-400 uppercase">MST Output Graph</span>
            <svg viewBox="0 0 600 400" className="w-full h-full max-w-full">
              {/* Draw Edges */}
              {primResult.mstEdges?.map((edge, idx) => {
                const nodeA = nodes.find(n => n.id === edge.from);
                const nodeB = nodes.find(n => n.id === edge.to);
                if (!nodeA || !nodeB) return null;
                return (
                  <line 
                    key={`mst-edge-${idx}`}
                    x1={nodeA.x} 
                    y1={nodeA.y} 
                    x2={nodeB.x} 
                    y2={nodeB.y} 
                    stroke="#10b981" 
                    strokeWidth="4" 
                  />
                );
              })}
              {/* Draw Nodes */}
              {nodes.map(node => (
                <g key={`mst-node-${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
                  <circle r="12" fill={node.isHub ? "#059669" : "#cbd5e1"} stroke="#ffffff" strokeWidth="2" />
                  <text textAnchor="middle" dominantBaseline="middle" fill={node.isHub ? "#ffffff" : "#475569"} className="text-[12px] font-bold" y="1">
                    {node.id}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* 4. Activity Logs (Real-time Console) */}
      <div className={`bg-gray-900 rounded-2xl border border-gray-800 shadow-lg flex flex-col overflow-hidden ${isConsoleOpen ? 'flex-1 min-h-[160px]' : ''}`}>
        {/* Terminal Header */}
        <div 
          className="bg-gray-950 px-4 py-3 border-b border-gray-800 flex items-center justify-between text-xs text-gray-400 font-black uppercase tracking-wider shrink-0 cursor-pointer hover:bg-gray-900 transition-colors"
          onClick={() => setIsConsoleOpen(!isConsoleOpen)}
        >
          <span className="flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-green-400" />
            Algorithmic Stepper activity console
          </span>
          <div className="flex items-center gap-2">
            {isConsoleOpen && <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping"></span>}
            {isConsoleOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>

        {/* Terminal Display */}
        {isConsoleOpen && (
          <div className="flex-1 p-3 overflow-y-auto font-mono text-[0.7rem] text-gray-300 flex flex-col gap-2 relative">
            <div ref={terminalTopRef}></div>
            {executionLog.length === 0 ? (
              <div className="text-gray-500 italic text-center my-auto">
                CONSOLE STANDBY // Run an optimization solver to view operations.
              </div>
            ) : (
              <>
                {executionLog.map((log, index) => (
                  <div key={index} className="flex gap-2 leading-relaxed select-text border-b border-gray-800/30 pb-1.5 last:border-0">
                    <span className="text-green-400 font-bold">[{index + 1}]</span>
                    <span className="text-gray-300">{log}</span>
                  </div>
                ))}
                
                {/* Jump to top button at the end of the console */}
                <div className="flex justify-center mt-4 mb-2">
                  <button 
                    onClick={scrollToTop}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-[0.65rem] font-bold transition-colors border border-gray-700 shadow-sm"
                  >
                    <ChevronUp className="h-3 w-3 text-green-400" />
                    Jump to Top
                  </button>
                </div>
              </>
            )}
            <div ref={terminalEndRef}></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Factorial Helper
function factorial(num) {
  if (num <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= num; i++) {
    res *= i;
  }
  return res;
}
