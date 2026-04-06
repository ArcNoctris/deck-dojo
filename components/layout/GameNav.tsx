"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutGrid, Swords, Database, Trophy, Menu, X, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function GameNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Don't show the pause menu button on the Start Menu (root)
  if (pathname === '/') return null;

  const menuItems = [
    { label: 'SYSTEM_ROOT', href: '/', icon: Home, color: 'text-cyan-500' },
    { label: 'THE_ARMORY', href: '/dashboard', icon: LayoutGrid, color: 'text-cyan-500' },
    { label: 'THE_DOJO', href: '/duel', icon: Swords, color: 'text-strike-red' },
    { label: 'THE_ARENA', href: '/arena', icon: Trophy, color: 'text-focus-amber' },
    { label: 'DATA_ARCHIVE', href: '/cards', icon: Database, color: 'text-cyan-500' },
  ];

  return (
    <>
      {/* HUD Trigger */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50 p-2 bg-navy-800/80 border border-cyan-500/30 text-cyan-500 chamfered hover:bg-cyan-500/10 hover:border-cyan-500 transition-all backdrop-blur-md group shadow-[0_0_15px_rgba(8,217,214,0.1)]"
      >
        <Menu className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Pause Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/95 backdrop-blur-xl">
          {/* Background scanlines effect (simulated) */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(8, 217, 214, 0.03) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />

          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 text-cyan-500 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative z-10 w-full max-w-2xl px-6">
            <div className="text-center mb-12">
              <h2 className="text-sm font-mono text-cyan-500 tracking-[0.3em] mb-2">SYSTEM.PAUSE_MENU</h2>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white tracking-widest glow-text">
                SELECT DESTINATION
              </h1>
            </div>

            <div className="flex flex-col gap-4">
              {menuItems.map((item, index) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link 
                    key={item.href}
                    href={item.href}
                    className={`group relative overflow-hidden chamfered-all border p-4 flex items-center gap-6 transition-all duration-300
                      ${isActive 
                        ? 'bg-navy-800 border-cyan-500 shadow-[0_0_20px_rgba(8,217,214,0.2)]' 
                        : 'bg-navy-900/50 border-navy-800 hover:border-cyan-500/50 hover:bg-navy-800'
                      }
                    `}
                  >
                    {/* Hover highlight bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className={`p-3 rounded-sm bg-navy-950 ${isActive ? 'ring-1 ring-cyan-500/30' : ''}`}>
                      <item.icon className={`w-6 h-6 ${item.color} ${isActive ? 'animate-pulse' : ''}`} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`font-mono text-xl tracking-wider ${isActive ? 'text-cyan-400 font-bold' : 'text-gray-300 group-hover:text-white'}`}>
                        {item.label}
                      </h3>
                    </div>
                    
                    <div className="font-mono text-xs text-gray-600 group-hover:text-cyan-500/50 transition-colors">
                      0{index + 1}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
