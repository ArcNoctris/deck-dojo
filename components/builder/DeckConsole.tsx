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
    <div className={`fixed bottom-24 left-4 right-20 z-30 transition-all duration-300 ${isExpanded ? 'h-64' : 'h-12'}`}>
        <div className={`w-full h-full bg-navy-900/95 backdrop-blur-md border ${statusBorder} rounded-lg shadow-2xl flex flex-col overflow-hidden`}>
            {/* Header / Collapsed View */}
            <div 
                className={`flex items-center justify-between px-4 py-3 cursor-pointer ${statusBg} transition-colors hover:bg-opacity-20`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${isValid ? (warnings.length > 0 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-red-500'} ${!isValid ? 'animate-pulse' : ''}`} />
                    <span className={`font-mono text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                        {isValid ? 'DECK LEGAL' : 'DECK ILLEGAL'}
                    </span>
                    <span className="text-gray-500 text-[10px] font-mono border-l border-gray-700 pl-3">
                        {errors.length} ERRORS / {warnings.length} WARNINGS
                    </span>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 bg-black/40">
                    {errors.length === 0 && warnings.length === 0 && (
                        <div className="text-green-500 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> System Optimal. No issues detected.
                        </div>
                    )}
                    {errors.map((err, i) => (
                        <div key={`err-${i}`} className="text-red-400 flex items-start gap-2 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                            <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{err}</span>
                        </div>
                    ))}
                    {warnings.map((warn, i) => (
                        <div key={`warn-${i}`} className="text-yellow-400 flex items-start gap-2 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${(errors.length + i) * 50}ms` }}>
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{warn}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
