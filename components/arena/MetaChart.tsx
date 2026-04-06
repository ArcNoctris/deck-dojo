"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MetaChartProps {
  data: { deck: string, total: number, winRate: number }[];
}

export function MetaChart({ data }: MetaChartProps) {
  // Take top 5 for the pie chart and group the rest into "Other"
  let chartData = [];
  if (data.length <= 6) {
    chartData = data;
  } else {
    chartData = data.slice(0, 5);
    const others = data.slice(5).reduce((acc, curr) => acc + curr.total, 0);
    chartData.push({ deck: 'Other', total: others, winRate: 0 });
  }

  const COLORS = ['#08D9D6', '#FF2E63', '#F9ED69', '#A855F7', '#3B82F6', '#6B7280'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="total"
          nameKey="deck"
          stroke="none"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: '#0B0C10', borderColor: '#1F2833', borderRadius: '8px', color: '#fff' }}
          itemStyle={{ color: '#fff' }}
          formatter={(value: any) => [`${value} Matches`, 'Encounters']}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontFamily: 'monospace' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}