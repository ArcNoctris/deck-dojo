'use client';

import React, { useState } from 'react';
import { useBuilderStore } from '@/store/builder-store';
import { validateDeck } from '@/utils/deck-validator';
import { AlertTriangle, CheckCircle, XCircle, ChevronUp, ChevronDown } from 'lucide-react';

export const DeckConsole = () => {
  const store = useBuilderStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Re-run validation on render (fast enough) or useMemo if needed
  const result = validateDeck(store);

  const { isValid, errors, warnings } = result;
  const statusColor = isValid ? (warnings.length > 0 ? 'text-yellow-500' : 'text-green-500') : 'text-red-500';
  const statusBg = isValid ? (warnings.length > 0 ? 'bg-yellow-500/10' : 'bg-green-500/10') : 'bg-red-500/10';
  const statusBorder = isValid ? (warnings.length > 0 ? 'border-yellow-500/30' : 'border-green-500/30') : 'border-red-500/30';

  if (isValid && warnings.length === 0 && !isExpanded) {
      // Optional: Hide if perfect? Or show "Legal" indicator.
      // We'll show "Legal" indicator as per instructions "Shows simple Status Dot".
  }

  return (
    <div className="fixed bottom-24 left-4 z-30 flex flex-col items-start gap-2">
        {/* Expanded Content Popover */}
        {isExpanded && (
            <div className={`w-80 max-h-64 bg-navy-900/95 backdrop-blur-md border ${statusBorder} rounded-lg shadow-2xl flex flex-col overflow-hidden mb-2 animate-in slide-in-from-bottom-2 fade-in duration-200`}>
                <div className="flex items-center justify-between px-3 py-2 bg-black/40 border-b border-white/5">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">System Diagnostics</span>
                    <button onClick={() => setIsExpanded(false)}><ChevronDown className="w-3 h-3 text-gray-500 hover:text-white" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2">
                    {errors.length === 0 && warnings.length === 0 && (
                        <div className="text-green-500 flex items-center gap-2">
                            <CheckCircle className="w-3 h-3" /> System Optimal.
                        </div>
                    )}
                    {errors.map((err, i) => (
                        <div key={`err-${i}`} className="text-red-400 flex items-start gap-2">
                            <XCircle className="w-3 h-3 shrink-0 mt-0.5" />
                            <span>{err}</span>
                        </div>
                    ))}
                    {warnings.map((warn, i) => (
                        <div key={`warn-${i}`} className="text-yellow-400 flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                            <span>{warn}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Slim Status Pill */}
        <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`h-8 px-3 rounded-full flex items-center gap-2 cursor-pointer shadow-lg transition-all ${statusBg} border ${statusBorder} hover:brightness-110 backdrop-blur-sm`}
        >
            <div className={`w-2 h-2 rounded-full ${isValid ? (warnings.length > 0 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-red-500'} ${!isValid ? 'animate-pulse' : ''}`} />
            <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                {isValid ? 'LEGAL' : 'ILLEGAL'}
            </span>
            {(!isValid || warnings.length > 0) && (
                <span className="text-[10px] text-gray-400 font-mono pl-2 border-l border-white/10 flex gap-1">
                    {errors.length > 0 && <span className="text-red-400">{errors.length}</span>}
                    {errors.length > 0 && warnings.length > 0 && <span>/</span>}
                    {warnings.length > 0 && <span className="text-yellow-400">{warnings.length}</span>}
                </span>
            )}
        </div>
    </div>
  );
};
