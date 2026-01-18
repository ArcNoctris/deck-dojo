import React from 'react';

interface CyberCardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
}

export const CyberCard = ({ children, className = '', title }: CyberCardProps) => {
  return (
    <div className={`relative group bg-navy-800/80 backdrop-blur-md border border-cyan-500/30 shadow-lg hover:border-cyan-500/50 transition-colors duration-300 ${className}`}>
        {/* Decorative Corner Accents (Cyberpunk Style) */}
        <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-cyan-500 opacity-60 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-2 border-r-2 border-cyan-500 opacity-60 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-2 border-l-2 border-cyan-500 opacity-60 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b-2 border-r-2 border-cyan-500 opacity-60 group-hover:opacity-100 transition-opacity"></div>
        
        {/* Optional Header */}
        {title && (
            <div className="bg-navy-900/40 px-5 py-3 border-b border-cyan-500/20">
                <h3 className="font-heading text-lg font-bold text-cyan-500 tracking-widest uppercase glow-text-sm">
                  {title}
                </h3>
            </div>
        )}
        
        <div className="p-5">
            {children}
        </div>
    </div>
  );
};
