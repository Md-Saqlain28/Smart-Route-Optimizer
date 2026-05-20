import React from 'react';
import { presets } from '../utils/presets';
import { Database } from 'lucide-react';

export default function PresetSelector({ activePresetKey, onSelectPreset }) {
  const presetKeys = Object.keys(presets);

  return (
    <div className="bg-[#0a0a0a]/80 border border-neutral-900 p-5 rounded-2xl shadow-xl flex flex-col gap-4">
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-2 border-b border-neutral-900/50 pb-2">
        <Database className="h-4 w-4 text-rose-400" />
        Select a Network To Begin
      </h3>

      <div className="flex flex-col gap-3">
        {presetKeys.map(key => {
          const preset = presets[key];
          const isActive = activePresetKey === key;
          const nodeNum = preset.nodes.length;
          const edgeNum = preset.edges.length;

          return (
            <div
              key={key}
              onClick={() => onSelectPreset(key)}
              className={`group relative overflow-hidden w-full text-left p-4 rounded-xl border transition-all duration-300 ease-in-out cursor-pointer flex flex-col gap-2 ${
                isActive
                  ? 'bg-rose-950/20 border-rose-500/50 shadow-md ring-1 ring-rose-500/20'
                  : 'bg-black/40 border-neutral-900 hover:scale-[1.01] hover:shadow-lg hover:border-rose-500/30 hover:bg-neutral-900/40'
              }`}
            >
              {/* Decorative absolute top border scaling in on hover */}
              <div 
                className={`absolute top-0 left-0 h-1 bg-rose-500 transition-transform duration-300 origin-left ${
                  isActive ? 'w-full scale-x-100' : 'w-full scale-x-0 group-hover:scale-x-100'
                }`}
              />
              
              <div className="flex items-center justify-between w-full mt-1">
                <span className={`text-sm font-bold ${isActive ? 'text-rose-300' : 'text-neutral-300 group-hover:text-rose-400'}`}>
                  {preset.name}
                </span>
                
                {/* Meta details with specific requested styling */}
                <div className="flex gap-1.5 text-[0.65rem]">
                  <span className={`px-2 py-0.5 rounded-md border ${
                    isActive ? 'bg-rose-950/40 text-rose-300 border-rose-500/20 font-bold' : 'bg-neutral-900/60 text-neutral-400 border-neutral-900 font-medium'
                  }`}>
                    {nodeNum} Pins
                  </span>
                  <span className={`px-2 py-0.5 rounded-md border ${
                    isActive ? 'bg-rose-950/40 text-rose-300 border-rose-500/20 font-bold' : 'bg-neutral-900/60 text-neutral-400 border-neutral-900 font-medium'
                  }`}>
                    {edgeNum} Roads
                  </span>
                </div>
              </div>
              
              <p className={`text-xs leading-relaxed font-medium ${isActive ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {preset.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
