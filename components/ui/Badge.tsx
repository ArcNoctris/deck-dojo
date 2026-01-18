import React from 'react';

export type BadgeVariant = 'cyan' | 'red' | 'amber' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge = ({ label, variant = 'default', className = '' }: BadgeProps) => {
  const variants = {
    cyan: "bg-cyan-500/10 text-cyan-500 border-cyan-500 shadow-[0_0_5px_rgba(8,217,214,0.2)]",
    red: "bg-red-500/10 text-red-500 border-red-500 shadow-[0_0_5px_rgba(255,46,99,0.2)]",
    amber: "bg-amber-400/10 text-amber-400 border-amber-400 shadow-[0_0_5px_rgba(249,237,105,0.2)]",
    default: "bg-navy-800 text-gray-400 border-gray-600"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${variants[variant]} uppercase tracking-wide ${className}`}>
      {label}
    </span>
  );
};
