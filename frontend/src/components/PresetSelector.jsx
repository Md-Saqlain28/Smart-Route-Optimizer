import React from 'react';
import { presets } from '../utils/presets';
import { Network, Database } from 'lucide-react';

export default function PresetSelector({
  activePresetKey,
  onSelectPreset,
  nodeCount,
  edgeCount
}) {
  const presetKeys = Object.keys(presets);

  return (
    <div className="bg-white p-4 rounded-2xl border border-green-50 shadow-sm">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
        <Database className="h-3.5 w-3.5 text-green-500" />
        Load Network presets
      </h3>

      <div className="flex flex-col gap-2">
        {presetKeys.map(key => {
          const preset = presets[key];
          const isActive = activePresetKey === key;
          const nodeNum = preset.nodes.length;
          const edgeNum = preset.edges.length;

          return (
            <button
              key={key}
              onClick={() => onSelectPreset(key)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                isActive
                  ? 'bg-green-50/50 border-green-200 ring-2 ring-green-500/10'
                  : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-bold ${isActive ? 'text-green-700 font-extrabold' : 'text-slate-700'}`}>
                  {preset.name}
                </span>
                
                {/* Meta details */}
                <div className="flex gap-1.5 text-[9px] font-extrabold">
                  <span className={`px-2 py-0.5 rounded-full ${isActive ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-600'}`}>
                    {nodeNum} Pins
                  </span>
                  <span className={`px-2 py-0.5 rounded-full ${isActive ? 'bg-green-200 text-green-800' : 'bg-slate-200 text-slate-600'}`}>
                    {edgeNum} Roads
                  </span>
                </div>
              </div>
              
              <p className="text-[10px] leading-relaxed text-slate-500 font-medium">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
      
      {/* Current Network Summary stats */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
        <span>Active Map Capacity:</span>
        <div className="flex gap-2">
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">{nodeCount} Nodes</span>
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">{edgeCount} Edges</span>
        </div>
      </div>
    </div>
  );
}
