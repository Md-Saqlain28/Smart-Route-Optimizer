import React from 'react';
import { useNavigate } from 'react-router-dom';
import { presets } from '../utils/presets';
import { Navigation, Database } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const presetKeys = Object.keys(presets);

  const handleSelectPreset = (key) => {
    // Navigate to workspace and pass the preset key via query or state
    navigate(`/workspace?preset=${key}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 antialiased">
      <div className="max-w-4xl w-full flex flex-col items-center gap-10">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="bg-red-600 p-4 rounded-2xl shadow-lg shadow-red-100 flex items-center justify-center text-white">
            <Navigation className="h-10 w-10 rotate-45" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-800 flex items-center justify-center gap-3">
              LogiRoute
              <span className="text-sm font-extrabold uppercase px-3 py-1 rounded-full bg-red-100 text-red-700 tracking-wider">
                Engine v2.0
              </span>
            </h1>
            <p className="text-gray-500 font-semibold mt-2 text-lg">
              Dynamic Route Optimization & Complexity Benchmarking Sandbox
            </p>
          </div>
        </div>

        {/* Preset Selection Menu */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 w-full max-w-2xl flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Database className="h-5 w-5 text-red-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Select a Network to Begin
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {presetKeys.map(key => {
              const preset = presets[key];
              const nodeNum = preset.nodes.length;
              const edgeNum = preset.edges.length;

              return (
                <button
                  key={key}
                  onClick={() => handleSelectPreset(key)}
                  className="w-full text-left p-5 rounded-2xl border-2 border-gray-100 hover:border-red-400 hover:bg-red-50/30 transition-all flex flex-col gap-2 group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xl font-black text-gray-800 group-hover:text-red-700 transition-colors">
                      {preset.name}
                    </span>
                    
                    <div className="flex gap-2 text-xs font-extrabold">
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 group-hover:bg-red-100 group-hover:text-red-700 transition-colors">
                        {nodeNum} Pins
                      </span>
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 group-hover:bg-red-100 group-hover:text-red-700 transition-colors">
                        {edgeNum} Roads
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 font-medium text-sm leading-relaxed">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
