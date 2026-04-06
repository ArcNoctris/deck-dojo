"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MatchupSpreadProps {
  matches: any[];
}

export function MatchupSpread({ matches }: MatchupSpreadProps) {
  // Aggregate matches by opponent
  const stats: Record<string, { wins: number, total: number }> = {};
  
  matches.forEach(match => {
    const opp = match.opponent_deck || 'Unknown';
    if (!stats[opp]) stats[opp] = { wins: 0, total: 0 };
    
    stats[opp].total++;
    if (match.result === 'win') stats[opp].wins++;
  });

  // Calculate win rate per opponent, filter low sample sizes or just show all
  const data = Object.entries(stats)
    .map(([name, data]) => ({
      name,
      winRate: Number(((data.wins / data.total) * 100).toFixed(1)),
      total: data.total
    }))
    .sort((a, b) => b.total - a.total) // Sort by most faced
    .slice(0, 10); // Show top 10 most faced

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2833" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} stroke="#4b5563" tick={{fill: '#4b5563', fontSize: 10}} />
          <YAxis dataKey="name" type="category" stroke="#4b5563" tick={{fill: '#9ca3af', fontSize: 11}} width={80} />
          <Tooltip 
            cursor={{fill: 'rgba(255,255,255,0.05)'}}
            contentStyle={{ backgroundColor: '#0B0C10', borderColor: '#1F2833', borderRadius: '8px' }}
            formatter={(value: any) => [`${value}%`, 'Win Rate']}
          />
          <Bar dataKey="winRate" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.winRate >= 50 ? '#10b981' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}