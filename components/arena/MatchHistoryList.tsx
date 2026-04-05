'use client';

import React, { useEffect, useState } from 'react';
import { getMatchHistory } from '@/app/arena/actions';
import { Trophy, Skull, Minus, Clock, FileText } from 'lucide-react';

interface MatchHistoryListProps {
  deckId: string;
}

export const MatchHistoryList = ({ deckId }: MatchHistoryListProps) => {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMatches = () => {
    if (!deckId) return;
    setIsLoading(true);
    getMatchHistory(deckId).then(data => {
        setMatches(data || []);
        setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchMatches();
  }, [deckId]);

  if (isLoading) return <div className="text-center text-xs text-gray-500 py-8 animate-pulse">LOADING BATTLE LOGS...</div>;

  if (matches.length === 0) return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 border border-dashed border-navy-700 rounded-lg bg-navy-800/20">
          <Trophy className="w-8 h-8 mb-2 opacity-20" />
          <span className="text-sm font-mono">NO BATTLES RECORDED</span>
      </div>
  );

  return (
    <div className="space-y-2">
        {matches.map((match) => (
            <div key={match.id} className="grid grid-cols-12 gap-4 p-4 bg-navy-800/50 rounded border border-navy-700 hover:border-cyan-500/30 transition-colors group">
                {/* Result Icon */}
                <div className="col-span-1 flex items-center justify-center">
                    {match.result === 'win' && <Trophy className="w-5 h-5 text-green-500" />}
                    {match.result === 'loss' && <Skull className="w-5 h-5 text-red-500" />}
                    {match.result === 'draw' && <Minus className="w-5 h-5 text-gray-500" />}
                </div>

                {/* Opponent & Details */}
                <div className="col-span-8 flex flex-col justify-center">
                    <span className="font-heading text-sm text-white group-hover:text-cyan-400 transition-colors">
                        VS {match.opponent_deck || 'Unknown'}
                    </span>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono mt-1">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(match.created_at).toLocaleDateString()}
                        </span>
                        <span>
                            {match.going_first ? 'GOING 1ST' : 'GOING 2ND'}
                        </span>
                        <span className="bg-navy-900 px-1.5 rounded border border-navy-700 text-gray-400">
                            {match.deck_version?.name || 'v?'}
                        </span>
                    </div>
                    {match.notes && (
                        <div className="mt-2 text-xs text-gray-400 italic flex items-start gap-1">
                            <FileText className="w-3 h-3 mt-0.5 shrink-0" />
                            {match.notes}
                        </div>
                    )}
                </div>

                {/* Result Text */}
                <div className="col-span-3 flex items-center justify-end">
                    <span className={`font-heading text-lg tracking-widest ${
                        match.result === 'win' ? 'text-green-500' : 
                        match.result === 'loss' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                        {match.result?.toUpperCase()}
                    </span>
                </div>
            </div>
        ))}
    </div>
  );
};
