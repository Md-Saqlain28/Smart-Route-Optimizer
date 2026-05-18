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
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  // Auto-scroll the activity terminal to the bottom as logs arrive
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [executionLog]);

  // Determine if warning threshold is breached (> 10 nodes)
  const showWarning = nodeCount > 10;

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
      <div className="bg-gradient-to-r from-green-900 to-green-950 text-white p-4 rounded-2xl border border-green-950 shadow-md">
        <h2 className="text-sm font-extrabold flex items-center gap-2">
          <BarChart3 className="h-4.5 w-4.5 text-emerald-400" />
          Logistics Performance Analytics
        </h2>
        <p className="text-[10px] text-green-200 mt-1 font-medium leading-relaxed">
          Real-time metrics, computational complexity tracking, and algorithmic benchmarks calculated directly in your browser.
        </p>
      </div>

      {/* 2. Factoring Combinatorial Warning Banner */}
      {showWarning && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col gap-2.5 animate-bounce-subtle">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-red-800 uppercase tracking-wide">
                Factorial Combinatorial Hazard!
              </h4>
              <p className="text-[10px] leading-relaxed text-red-600 font-semibold mt-0.5">
                The current map contains <span className="underline">{nodeCount} locations</span>. Running the **Brute Force** TSP solver will trigger a combinatorial explosion:
              </p>
            </div>
          </div>
          
          <div className="bg-white/60 border border-red-100 rounded-xl p-2.5 text-[9px] font-semibold text-slate-600 leading-relaxed">
            <div className="flex justify-between border-b border-red-50 pb-1 mb-1 font-extrabold">
              <span>Nodes (N)</span>
              <span>Permutations evaluated $(N-1)!$</span>
            </div>
            <div className="flex justify-between">
              <span>5 nodes</span>
              <span>$4! = 24$</span>
            </div>
            <div className="flex justify-between">
              <span>8 nodes</span>
              <span>$7! = 5,040$</span>
            </div>
            <div className="flex justify-between text-amber-600">
              <span>10 nodes</span>
              <span>$9! = 362,880$ (Safe Limit)</span>
            </div>
            <div className="flex justify-between text-red-600 font-bold">
              <span>{nodeCount} nodes</span>
              <span>$({nodeCount}-1)! = {factorial(nodeCount - 1).toLocaleString()}$ permutations!</span>
            </div>
          </div>

          <div className="text-[9px] leading-relaxed text-red-700 font-medium">
            <strong>Space-Time Tradeoff Detail:</strong> Brute force evaluates every path ($O(N!)$ time, $O(N)$ space), freezing the main browser thread. The Held-Karp DP solver uses bitmask memoization to run in $O(N^2 2^N)$ time and $O(N 2^N)$ space, solving a 12-node regional route in just milliseconds!
          </div>
        </div>
      )}

      {/* 3. Metrics Comparison Grid */}
      {selectedAlgo === 'tsp' && tspResult && (
        <div className="bg-white p-4 rounded-2xl border border-green-50 shadow-sm flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
            <Cpu className="h-4.5 w-4.5 text-green-500" />
            TSP Solver Side-by-Side Comparison
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Approach A: Brute Force */}
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Approach A: Brute Force
              </span>
              
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400">Total Distance</span>
                <span className="text-sm font-black text-slate-700">
                  {tspResult.brute?.cost ? `${tspResult.brute.cost} km` : 'N/A (Capped)'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400">Execution Time</span>
                <span className={`text-xs font-black ${tspResult.brute?.duration > 100 ? 'text-amber-600' : 'text-slate-600'}`}>
                  {tspResult.brute?.duration !== undefined ? `${tspResult.brute.duration} ms` : 'Blocked (> 10 Nodes)'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400">Complexity</span>
                <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100 w-fit mt-0.5">
                  $O(n!)$ Factorial
                </span>
              </div>
              
              {tspResult.brute?.permutationsChecked && (
                <div className="text-[9px] text-slate-400 font-bold border-t border-slate-200/50 pt-1.5 mt-1">
                  Evaluated: {tspResult.brute.permutationsChecked.toLocaleString()} paths
                </div>
              )}
            </div>

            {/* Approach B: Dynamic Programming */}
            <div className="bg-green-50/30 border border-green-100/50 p-3 rounded-xl flex flex-col gap-2">
              <span className="text-[10px] font-black text-green-600 uppercase tracking-wide">
                Approach B: Held-Karp DP
              </span>
              
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400">Total Distance</span>
                <span className="text-sm font-black text-green-700">
                  {tspResult.dp?.cost ? `${tspResult.dp.cost} km` : 'N/A'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400">Execution Time</span>
                <span className="text-xs font-black text-emerald-600">
                  {tspResult.dp?.duration !== undefined ? `${tspResult.dp.duration} ms` : 'N/A'}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400">Complexity</span>
                <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 w-fit mt-0.5">
                  $O(n^2 \cdot 2^n)$ Expo
                </span>
              </div>

              <div className="text-[9px] text-green-500 font-bold border-t border-green-100/40 pt-1.5 mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Solved via Memoization
              </div>
            </div>
          </div>

          {/* Tour Sequence Display */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-1 mt-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">
              Optimized Delivery Loop Sequence
            </span>
            <p className="text-[10px] leading-relaxed text-slate-700 font-extrabold break-words">
              {formatTour(tspResult.dp?.tour)}
            </p>
          </div>
        </div>
      )}

      {selectedAlgo === 'dijkstra' && dijkstraResult && (
        <div className="bg-white p-4 rounded-2xl border border-green-50 shadow-sm flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
            Dijkstra Shortest Path Result
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col">
              <span className="text-[9px] font-bold text-slate-400">Shortest Distance</span>
              <span className="text-sm font-black text-slate-700">
                {dijkstraResult.distance !== null && dijkstraResult.distance !== Infinity 
                  ? `${dijkstraResult.distance} km` 
                  : 'Unreachable'}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col">
              <span className="text-[9px] font-bold text-slate-400">Greedy Complexity</span>
              <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 w-fit mt-0.5">
                $O(E \log V)$
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">
              Shortest Routing Path
            </span>
            <p className="text-[10px] leading-relaxed text-slate-700 font-extrabold break-words">
              {formatTour(dijkstraResult.path)}
            </p>
          </div>
        </div>
      )}

      {selectedAlgo === 'prim' && primResult && (
        <div className="bg-white p-4 rounded-2xl border border-green-50 shadow-sm flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
            <CheckCircle2 className="h-4.5 w-4.5 text-green-500" />
            Prim's Spanning Network Result
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col">
              <span className="text-[9px] font-bold text-slate-400">Total MST Network Cost</span>
              <span className="text-sm font-black text-slate-700">
                {primResult.totalCost !== undefined ? `${primResult.totalCost.toFixed(1)} km` : 'N/A'}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col">
              <span className="text-[9px] font-bold text-slate-400">MST Complexity</span>
              <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 w-fit mt-0.5">
                $O(E \log V)$
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">
              MST Road Link Count
            </span>
            <p className="text-[10px] leading-relaxed text-slate-700 font-extrabold break-words">
              Connected {nodes.length} nodes using {primResult.mstEdges?.length || 0} highway links.
            </p>
          </div>
        </div>
      )}

      {/* 4. Activity Logs (Real-time Console) */}
      <div className={`bg-slate-900 rounded-2xl border border-slate-800 shadow-lg flex flex-col overflow-hidden ${isConsoleOpen ? 'flex-1 min-h-[160px]' : ''}`}>
        {/* Terminal Header */}
        <div 
          className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-wider shrink-0 cursor-pointer hover:bg-slate-900 transition-colors"
          onClick={() => setIsConsoleOpen(!isConsoleOpen)}
        >
          <span className="flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            Algorithmic Stepper activity console
          </span>
          <div className="flex items-center gap-2">
            {isConsoleOpen && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>}
            {isConsoleOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>

        {/* Terminal Display */}
        {isConsoleOpen && (
          <div className="flex-1 p-3 overflow-y-auto font-mono text-[9px] text-slate-300 flex flex-col gap-2">
            {executionLog.length === 0 ? (
              <div className="text-slate-500 italic text-center my-auto">
                CONSOLE STANDBY // Run an optimization solver to view operations.
              </div>
            ) : (
              executionLog.map((log, index) => (
                <div key={index} className="flex gap-2 leading-relaxed select-text border-b border-slate-800/30 pb-1.5 last:border-0">
                  <span className="text-green-400 font-bold">[{index + 1}]</span>
                  <span className="text-slate-300">{log}</span>
                </div>
              ))
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
