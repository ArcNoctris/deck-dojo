'use client';

import { useEffect, useState } from 'react';

const SESSION_KEY = 'deckdojo-splash-shown';

export const HomeSplash = () => {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setVisible(true);
    sessionStorage.setItem(SESSION_KEY, '1');

    const fadeTimer = setTimeout(() => setFading(true), 1300);
    const removeTimer = setTimeout(() => setVisible(false), 1850);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-[22px] bg-navy-900 transition-opacity duration-500 ease-out"
      style={{ opacity: fading ? 0 : 1, pointerEvents: fading ? 'none' : 'auto' }}
    >
      <div className="relative w-[82px] h-[82px]" style={{ animation: 'arcadeLogoIn .7s ease both' }}>
        <div
          className="absolute w-14 h-14 top-[13px] left-[2px] bg-navy-950 border border-navy-800 -rotate-[14deg]"
          style={{ clipPath: 'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)' }}
        />
        <div
          className="absolute w-14 h-14 top-[2px] left-[14px] grid place-items-center rotate-[10deg]"
          style={{
            background: 'linear-gradient(135deg,#5FF0EC,var(--color-cyan-500))',
            boxShadow: '0 0 34px rgba(8,217,214,.55)',
            clipPath: 'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)',
          }}
        >
          <div className="w-4 h-4 bg-navy-900 rotate-45" />
        </div>
      </div>
      <div className="font-pixel text-[15px] text-cyan-50 tracking-wide">DECK DOJO</div>
      <div className="w-[140px] h-1.5 bg-navy-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-cyan-500"
          style={{ boxShadow: '0 0 10px rgba(8,217,214,.6)', animation: 'arcadeBarFill 1.1s ease forwards' }}
        />
      </div>
    </div>
  );
};
