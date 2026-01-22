import React from 'react';

interface VisualizerProps {
  isActive: boolean;
  volume: number; // 0 to 1
}

export const Visualizer: React.FC<VisualizerProps> = ({ isActive, volume }) => {
  // We use CSS transforms for performance. 
  // We'll create 3 rings that pulse based on volume.
  
  const baseScale = 1;
  const pulseScale = isActive ? baseScale + (volume * 1.5) : baseScale;
  
  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Outer Ring - slow pulse */}
      <div 
        className={`absolute inset-0 rounded-full border-2 border-green-200 opacity-20 transition-transform duration-300 ease-out`}
        style={{ transform: `scale(${isActive ? 1.5 + (volume * 0.5) : 1})` }}
      />
      
      {/* Middle Ring - medium pulse */}
      <div 
        className={`absolute inset-4 rounded-full border border-green-300 opacity-40 transition-transform duration-150 ease-out`}
        style={{ transform: `scale(${isActive ? 1.2 + (volume * 0.8) : 1})` }}
      />

      {/* Inner Ring - fast pulse */}
      <div 
        className={`absolute inset-8 rounded-full bg-green-100 opacity-60 transition-transform duration-75 ease-out blur-xl`}
        style={{ transform: `scale(${pulseScale})` }}
      />
      
      {/* Core Circle */}
      <div className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 ${isActive ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-200/50' : 'bg-stone-200'}`}>
         {isActive ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
             </svg>
         ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
            </svg>
         )}
      </div>
    </div>
  );
};
