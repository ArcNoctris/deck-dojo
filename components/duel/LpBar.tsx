'use client';

import { computeLpBar } from '@/utils/duel/lp-bar';

interface LpBarProps {
  lp: number;
  startLp: number;
}

export const LpBar = ({ lp, startLp }: LpBarProps) => {
  const bar = computeLpBar(lp, startLp);
  const isGradient = bar.color.startsWith('linear-gradient');

  return (
    <div className="relative flex flex-col items-center gap-1.5">
      {bar.hasPips && (
        <div className="flex gap-1">
          {bar.pips.map(pip => (
            <span key={pip.key} className="w-2 h-2 rounded-[2px]" style={{ background: pip.color }} />
          ))}
          {bar.extraTiers > 0 && (
            <span className="font-mono font-bold text-[8px] text-[var(--color-arcade-text-muted)]">+{bar.extraTiers}</span>
          )}
        </div>
      )}
      <div className="relative w-[214px] h-[13px]">
        <div
          className="absolute top-0 left-0 w-[210px] h-[9px] rounded-[5px] overflow-hidden"
          style={{ background: 'rgba(28,37,48,.9)', boxShadow: '0 3px 6px rgba(0,0,0,.55), 0 0 0 1px rgba(0,0,0,.4)' }}
        >
          <div
            className="h-full transition-[width] duration-100 linear"
            style={{
              width: `${bar.pct}%`,
              background: bar.color,
              backgroundSize: isGradient ? '400% 100%' : undefined,
              animation: isGradient ? 'arcadeRainbow 3s linear infinite' : undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
};
