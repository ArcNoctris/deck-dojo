import React from 'react';

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  sublabel?: string;
  color?: string;
}

export const StatTile = ({ label, value, unit, sublabel, color = 'var(--color-cyan-50)' }: StatTileProps) => {
  return (
    <div className="flex-1 bg-navy-800/60 border border-navy-800 rounded-[10px] px-3 py-2.5">
      <div className="font-pixel text-[7.5px] text-gray-400 mb-1.5">{label}</div>
      <div className="font-heading font-bold text-xl leading-none" style={{ color }}>
        {value}
        {unit && <span className="text-xs text-gray-400">{unit}</span>}
      </div>
      {sublabel && (
        <div className="font-mono font-semibold text-[8.5px] text-gray-400 mt-0.5">{sublabel}</div>
      )}
    </div>
  );
};
