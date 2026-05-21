import React from 'react';
import { BarChart3, Cpu, CheckCircle2, MapPin } from 'lucide-react';

export default function AnalyticsPanel({
  nodeCount,
  selectedAlgo,
  dijkstraResult,
  primResult,
  tspResult,
  nodes,
  isAlgoFinished
}) {

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
      <div className="bg-gradient-to-r from-[#0a0a0a] to-[#120a0d] text-white p-4 rounded-2xl border border-neutral-900 shadow-xl shadow-rose-950/10">
        <h2 className="text-sm font-extrabold flex items-center gap-2 text-rose-300">
          <BarChart3 className="h-4.5 w-4.5 text-rose-400" />
          Logistics Performance Analytics
        </h2>
        <p className="text-xs text-neutral-400 mt-1 font-semibold leading-relaxed">
          Real-time metrics, computational complexity tracking, and algorithmic benchmarks calculated directly in your browser.
        </p>
      </div>

      {/* 2. Factoring Combinatorial Warning Banner Removed */}

      {/* 3. Metrics Comparison Grid */}
      {selectedAlgo === 'tsp' && (
        !tspResult ? (
          <div className="bg-[#0a0a0a]/40 border border-neutral-900/60 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 text-center min-h-[220px]">
            <div className="h-10 w-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              TSP Standby
            </h3>
            <p className="text-[0.7rem] text-neutral-500 max-w-[200px] leading-relaxed">
              Configure graph locations and hubs to prepare Traveling Salesman routing closure.
            </p>
          </div>
        ) : !isAlgoFinished ? (
          <div className="bg-[#0a0a0a]/40 border border-neutral-900/60 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 text-center min-h-[220px]">
            <div className="h-10 w-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 animate-pulse">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Awaiting Solver
            </h3>
            <p className="text-[0.7rem] text-neutral-500 max-w-[200px] leading-relaxed">
              Click the play button or step forward to run the algorithm visualizer to completion to view final routing metrics.
            </p>
          </div>
        ) : (
          <div className="bg-[#0a0a0a]/80 border border-neutral-900 p-4 rounded-2xl shadow-xl flex flex-col gap-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-900/60 pb-2.5">
              <Cpu className="h-4.5 w-4.5 text-amber-400" />
              TSP Solver Side-by-Side Comparison
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Approach A: Brute Force */}
              <div className="bg-black/40 border border-neutral-900 p-3 rounded-xl flex flex-col gap-2">
                <span className="text-[0.65rem] font-black text-neutral-500 uppercase tracking-wide">
                  Approach A: Brute Force
                </span>
                
                <div className="flex flex-col">
                  <span className="text-[0.7rem] font-bold text-neutral-500">Total Distance</span>
                  <span className="text-sm font-black text-neutral-300">
                    {tspResult.brute?.cost ? `${tspResult.brute.cost} km` : 'N/A (Capped)'}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[0.7rem] font-bold text-neutral-500">Execution Time</span>
                  <span className={`text-sm font-black ${tspResult.brute?.duration > 100 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {tspResult.brute?.duration !== undefined ? `${tspResult.brute.duration} ms` : 'Blocked (> 10 Nodes)'}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[0.7rem] font-bold text-neutral-500">Complexity</span>
                  <span className="text-[0.65rem] font-extrabold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-900/30 w-fit mt-0.5">
                    O(n!) Factorial
                  </span>
                </div>
                
                {tspResult.brute?.permutationsChecked && (
                  <div className="text-[0.65rem] text-neutral-500 font-bold border-t border-neutral-900/60 pt-1.5 mt-1">
                    Evaluated: {tspResult.brute.permutationsChecked.toLocaleString()} paths
                  </div>
                )}
              </div>

              {/* Approach B: Dynamic Programming */}
              <div className="bg-amber-950/20 border border-amber-500/20 p-3 rounded-xl flex flex-col gap-2">
                <span className="text-[0.65rem] font-black text-amber-400 uppercase tracking-wide">
                  Approach B: Held-Karp DP
                </span>
                
                <div className="flex flex-col">
                  <span className="text-[0.7rem] font-bold text-slate-400">Total Distance</span>
                  <span className="text-sm font-black text-amber-300">
                    {tspResult.dp?.cost ? `${tspResult.dp.cost} km` : 'N/A'}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[0.7rem] font-bold text-slate-400">Execution Time</span>
                  <span className="text-sm font-black text-emerald-400">
                    {tspResult.dp?.duration !== undefined ? `${tspResult.dp.duration} ms` : 'N/A'}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[0.7rem] font-bold text-slate-400">Complexity</span>
                  <span className="text-[0.65rem] font-extrabold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-900/30 w-fit mt-0.5">
                    O(n² · 2ⁿ) Expo
                  </span>
                </div>

                <div className="text-[0.65rem] text-emerald-400 font-bold border-t border-amber-900/20 pt-1.5 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  Solved via Memoization
                </div>
              </div>
            </div>

            {/* Tour Sequence Display */}
            <div className="bg-black/40 border border-neutral-900 rounded-xl p-3 flex flex-col gap-1 mt-1">
              <span className="text-[0.65rem] font-black text-neutral-500 uppercase tracking-wide">
                Optimized Delivery Loop Sequence
              </span>
              <p className="text-xs leading-relaxed text-slate-200 font-extrabold break-words">
                {formatTour(tspResult.dp?.tour)}
              </p>
            </div>
          </div>
        )
      )}

      {selectedAlgo === 'dijkstra' && (
        !dijkstraResult ? (
          <div className="bg-[#0a0a0a]/40 border border-neutral-900/60 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 text-center min-h-[220px]">
            <div className="h-10 w-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Destination Unset
            </h3>
            <p className="text-[0.7rem] text-neutral-500 max-w-[200px] leading-relaxed">
              Dijkstra requires both a starting Hub and a Destination customer pin. Click any location pin to set a destination.
            </p>
          </div>
        ) : !isAlgoFinished ? (
          <div className="bg-[#0a0a0a]/40 border border-neutral-900/60 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 text-center min-h-[220px]">
            <div className="h-10 w-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 animate-pulse">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Awaiting Solver
            </h3>
            <p className="text-[0.7rem] text-neutral-500 max-w-[200px] leading-relaxed">
              Click the play button or step forward to run the algorithm visualizer to completion to view final routing metrics.
            </p>
          </div>
        ) : (
          <div className="bg-[#0a0a0a]/80 border border-neutral-900 p-4 rounded-2xl shadow-xl flex flex-col gap-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-900/60 pb-2.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-cyan-400" />
              Dijkstra Shortest Path Result
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 border border-neutral-900 p-3 rounded-xl flex flex-col">
                <span className="text-[0.7rem] font-bold text-neutral-500">Shortest Distance</span>
                <span className="text-sm font-black text-slate-200 mt-0.5">
                  {dijkstraResult.distance !== null && dijkstraResult.distance !== Infinity 
                    ? `${dijkstraResult.distance} km` 
                    : 'Unreachable'}
                </span>
              </div>

              <div className="bg-black/40 border border-neutral-900 p-3 rounded-xl flex flex-col">
                <span className="text-[0.7rem] font-bold text-neutral-500">Greedy Complexity</span>
                <span className="text-[0.65rem] font-extrabold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-900/30 w-fit mt-0.5">
                  O(E log V)
                </span>
              </div>
            </div>

            <div className="bg-black/40 border border-neutral-900 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[0.65rem] font-black text-neutral-500 uppercase tracking-wide">
                Shortest Routing Path
              </span>
              <p className="text-xs leading-relaxed text-slate-200 font-extrabold break-words">
                {formatTour(dijkstraResult.path)}
              </p>
            </div>
          </div>
        )
      )}

      {selectedAlgo === 'prim' && (
        !primResult ? (
          <div className="bg-[#0a0a0a]/40 border border-neutral-900/60 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 text-center min-h-[220px]">
            <div className="h-10 w-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Prim MST Standby
            </h3>
            <p className="text-[0.7rem] text-neutral-500 max-w-[200px] leading-relaxed">
              Configure graph locations and hubs to prepare Spanning Tree construction.
            </p>
          </div>
        ) : !isAlgoFinished ? (
          <div className="bg-[#0a0a0a]/40 border border-neutral-900/60 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 text-center min-h-[220px]">
            <div className="h-10 w-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 animate-pulse">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Awaiting Solver
            </h3>
            <p className="text-[0.7rem] text-neutral-500 max-w-[200px] leading-relaxed">
              Click the play button or step forward to run the algorithm visualizer to completion to view final routing metrics.
            </p>
          </div>
        ) : (
          <div className="bg-[#0a0a0a]/80 border border-neutral-900 p-4 rounded-2xl shadow-xl flex flex-col gap-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 border-b border-neutral-900/60 pb-2.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
              Prim's Spanning Network Result
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 border border-neutral-900 p-3 rounded-xl flex flex-col">
                <span className="text-[0.7rem] font-bold text-neutral-500">Total MST Network Cost</span>
                <span className="text-sm font-black text-slate-200 mt-0.5">
                  {primResult.totalCost !== undefined ? `${primResult.totalCost.toFixed(1)} km` : 'N/A'}
                </span>
              </div>

              <div className="bg-black/40 border border-neutral-900 p-3 rounded-xl flex flex-col">
                <span className="text-[0.7rem] font-bold text-neutral-500">MST Complexity</span>
                <span className="text-[0.65rem] font-extrabold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-900/30 w-fit mt-0.5">
                  O(E log V)
                </span>
              </div>
            </div>

            <div className="bg-black/40 border border-neutral-900 rounded-xl p-3 flex flex-col gap-1">
              <span className="text-[0.65rem] font-black text-neutral-500 uppercase tracking-wide">
                MST Road Link Count
              </span>
              <p className="text-xs leading-relaxed text-slate-200 font-extrabold break-words">
                Connected {nodes.length} nodes using {primResult.mstEdges?.length || 0} highway links.
              </p>
            </div>

            {/* Separate Output Graph for Prim's Result */}
            <div className="bg-black border border-neutral-900 rounded-xl p-2 mt-2 shadow-inner h-[200px] flex items-center justify-center relative overflow-hidden">
              <span className="absolute top-2 left-3 text-[0.65rem] font-extrabold text-slate-500 uppercase">MST Output Graph</span>
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
                    <circle r="12" fill={node.isHub ? "#f43f5e" : "#1a1a1a"} stroke="#ffffff" strokeWidth="2" />
                    <text textAnchor="middle" dominantBaseline="middle" fill="#ffffff" className="text-[12px] font-bold" y="1">
                      {node.id}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )
      )}

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
