"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MatchData } from '@/app/arena/actions';

interface WinRateChartProps {
  matches: any[]; // Using any to accept the joined match history type
}

export function WinRateChart({ matches }: WinRateChartProps) {
  // Process data to calculate cumulative win rate over time
  // Matches come in descending order (newest first), so we reverse for the chart (left to right = oldest to newest)
  const chronological = [...matches].reverse();
  
  let wins = 0;
  const data = chronological.map((match, index) => {
    if (match.result === 'win') wins++;
    const total = index + 1;
    return {
      match: index + 1,
      rate: Number(((wins / total) * 100).toFixed(1)),
      opponent: match.opponent_deck,
      result: match.result
    };
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2833" />
          <XAxis dataKey="match" stroke="#4b5563" tick={{fill: '#4b5563', fontSize: 12}} />
          <YAxis stroke="#4b5563" tick={{fill: '#4b5563', fontSize: 12}} domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0B0C10', borderColor: '#1F2833', borderRadius: '8px' }}
            itemStyle={{ color: '#08D9D6' }}
            formatter={(value: any) => [`${value}%`, 'Win Rate']}
            labelFormatter={(label: any) => `Match ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="rate" 
            stroke="#08D9D6" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#0B0C10', stroke: '#08D9D6', strokeWidth: 2 }} 
            activeDot={{ r: 6, fill: '#08D9D6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}