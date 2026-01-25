'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { evaluateStat } from '@/utils/analytics/benchmarks';

interface VersionStats {
  versionName: string;
  starterProb: number;
  brickProb: number;
  date: string;
}

interface VersionTrendChartProps {
  data: VersionStats[];
}

export const VersionTrendChart = ({ data }: VersionTrendChartProps) => {
  if (!data || data.length === 0) {
      return <div className="text-center text-gray-500 py-10 font-mono text-sm">NO VERSION HISTORY AVAILABLE</div>;
  }

  // Reverse data to show oldest to newest if needed, depends on how it's passed.
  // Assuming parent passes oldest -> newest for chart X-Axis left-to-right.
  const chartData = [...data].reverse(); 

  return (
    <div className="bg-navy-800/50 border border-navy-700 rounded-lg p-4 h-80">
      <h3 className="font-heading text-sm text-cyan-500 uppercase tracking-widest mb-4">Evolution Trend</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="versionName" stroke="#64748b" fontSize={10} tick={{fill: '#64748b'}} />
          <YAxis stroke="#64748b" fontSize={10} tick={{fill: '#64748b'}} unit="%" domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="starterProb" 
            name="Starter Odds" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }} 
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            dataKey="brickProb" 
            name="Brick Odds" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const starterVal = payload[0].value;
    const brickVal = payload[1].value;

    const starterEval = evaluateStat('Starter', starterVal);
    const brickEval = evaluateStat('Brick', brickVal);

    return (
      <div className="bg-navy-900 border border-cyan-500/30 p-3 rounded shadow-xl backdrop-blur-md">
        <p className="font-heading text-white text-xs mb-2 border-b border-white/10 pb-1">{label}</p>
        
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase">Starter Odds</span>
                    <span className="text-sm font-bold text-white font-mono">{starterVal.toFixed(1)}%</span>
                    <span className="text-[10px]" style={{ color: starterEval.color }}>{starterEval.status}</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase">Brick Odds</span>
                    <span className="text-sm font-bold text-white font-mono">{brickVal.toFixed(1)}%</span>
                    <span className="text-[10px]" style={{ color: brickEval.color }}>{brickEval.status}</span>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return null;
};
