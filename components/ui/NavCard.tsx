import React from 'react';
import Link from 'next/link';

interface NavCardProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  meta?: string;
  disabled?: boolean;
}

export const NavCard = ({ href, label, icon, meta, disabled }: NavCardProps) => {
  const content = (
    <div
      className={`relative flex h-[66px] items-center gap-3.5 rounded-none border px-4 clip-notch transition-[box-shadow,border-color] duration-150 ${
        disabled
          ? 'opacity-70 border-navy-800 bg-navy-900/75'
          : 'border-navy-800 bg-navy-900/75 hover:border-cyan-500 hover:shadow-[0_0_24px_rgba(8,217,214,0.5)]'
      }`}
    >
      <span className="pointer-events-none absolute top-0 right-0 w-[11px] h-[11px] border-t-2 border-r-2 border-cyan-500" />
      <span className="pointer-events-none absolute bottom-0 left-0 w-[11px] h-[11px] border-b-2 border-l-2 border-cyan-500" />

      <div className="flex-none w-[38px] h-[38px] bg-navy-950 border border-navy-800 clip-notch-sm grid place-items-center text-cyan-500">
        {icon}
      </div>
      <div className="flex-1">
        <span className="font-heading font-bold text-2xl tracking-wide text-cyan-50">{label}</span>
      </div>
      {meta && (
        <span className="font-mono font-semibold text-[9px] text-gray-400">{meta}</span>
      )}
    </div>
  );

  if (disabled) {
    return <div aria-disabled>{content}</div>;
  }

  return <Link href={href}>{content}</Link>;
};
