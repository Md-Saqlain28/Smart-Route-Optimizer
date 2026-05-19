import React from 'react';
import { presets } from '../utils/presets';
import { Database } from 'lucide-react';

export default function PresetSelector({ activePresetKey, onSelectPreset }) {
  const presetKeys = Object.keys(presets);

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2 border-b border-gray-50 pb-2">
        <Database className="h-4 w-4 text-indigo-500" />
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
                  ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-500/20'
                  : 'bg-white border-gray-100 hover:scale-[1.01] hover:shadow-md hover:border-indigo-200'
              }`}
            >
              {/* Decorative absolute top border scaling in on hover */}
              <div 
                className={`absolute top-0 left-0 h-1 bg-indigo-500 transition-transform duration-300 origin-left ${
                  isActive ? 'w-full scale-x-100' : 'w-full scale-x-0 group-hover:scale-x-100'
                }`}
              />
              
              <div className="flex items-center justify-between w-full mt-1">
                <span className={`text-sm font-bold ${isActive ? 'text-indigo-700' : 'text-gray-700 group-hover:text-indigo-600'}`}>
                  {preset.name}
                </span>
                
                {/* Meta details with specific requested styling */}
                <div className="flex gap-1.5 text-[0.65rem]">
                  <span className={`px-2 py-0.5 rounded-md border ${
                    isActive ? 'bg-indigo-100 text-indigo-700 border-indigo-200 font-bold' : 'bg-slate-100 text-slate-700 border-slate-200 font-medium'
                  }`}>
                    {nodeNum} Pins
                  </span>
                  <span className={`px-2 py-0.5 rounded-md border ${
                    isActive ? 'bg-indigo-100 text-indigo-700 border-indigo-200 font-bold' : 'bg-slate-100 text-slate-700 border-slate-200 font-medium'
                  }`}>
                    {edgeNum} Roads
                  </span>
                </div>
              </div>
              
              <p className={`text-xs leading-relaxed font-medium ${isActive ? 'text-indigo-900/70' : 'text-gray-500'}`}>
                {preset.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
