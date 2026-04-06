import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { LayoutGrid, Swords, Database, Trophy, LogOut } from 'lucide-react';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profileName = "GUEST";
  if (user) {
      const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
      if (profile?.username) profileName = profile.username;
  }

  const menuItems = [
    { 
      label: 'THE ARMORY', 
      sub: 'DECK CONSTRUCTION',
      href: '/dashboard', 
      icon: LayoutGrid, 
      color: 'text-cyan-500',
      border: 'border-cyan-500',
      glow: 'shadow-[0_0_15px_rgba(8,217,214,0.3)] group-hover:shadow-[0_0_30px_rgba(8,217,214,0.6)]'
    },
    { 
      label: 'THE DOJO', 
      sub: 'TACTICAL SIMULATIONS',
      href: '/duel', 
      icon: Swords, 
      color: 'text-strike-red',
      border: 'border-strike-red',
      glow: 'shadow-[0_0_15px_rgba(255,46,99,0.3)] group-hover:shadow-[0_0_30px_rgba(255,46,99,0.6)]'
    },
    { 
      label: 'THE ARENA', 
      sub: 'MATCH LOG & ANALYTICS',
      href: '/arena', 
      icon: Trophy, 
      color: 'text-focus-amber',
      border: 'border-focus-amber',
      glow: 'shadow-[0_0_15px_rgba(249,237,105,0.3)] group-hover:shadow-[0_0_30px_rgba(249,237,105,0.6)]'
    },
    { 
      label: 'DATA ARCHIVE', 
      sub: 'KNOWLEDGE BASE',
      href: '/cards', 
      icon: Database, 
      color: 'text-cyan-500',
      border: 'border-cyan-500',
      glow: 'shadow-[0_0_10px_rgba(8,217,214,0.1)] group-hover:shadow-[0_0_20px_rgba(8,217,214,0.3)]'
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-navy-950 text-white relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'linear-gradient(rgba(8, 217, 214, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(8, 217, 214, 0.2) 1px, transparent 1px)', backgroundSize: '40px 40px', transform: 'perspective(500px) rotateX(60deg) scale(2.5) translateY(-50px)' }} />

      {/* Header Profile Status */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-mono text-cyan-500 tracking-[0.2em]">USER.PROFILE</div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-navy-900 border border-cyan-500/30 chamfered">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="font-heading font-bold text-lg">{profileName}</span>
          </div>
        </div>
        
        {user ? (
          <form action="/auth/signout" method="post" className="pointer-events-auto">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-gray-400 hover:text-strike-red transition-colors border border-transparent hover:border-strike-red/30 chamfered bg-navy-900/50">
              <LogOut className="w-4 h-4" /> LOGOUT
            </button>
          </form>
        ) : (
          <Link href="/login" className="pointer-events-auto flex items-center gap-2 px-4 py-2 text-sm font-mono text-cyan-400 hover:text-white transition-colors border border-cyan-500/30 hover:border-cyan-500 chamfered bg-navy-900/50">
            SYSTEM.LOGIN
          </Link>
        )}
      </header>

      {/* Main Start Menu */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-4xl mx-auto px-4 mt-12">
        {/* Title Art */}
        <div className="text-center mb-16 select-none flex flex-col items-center">
          <h2 className="font-mono text-cyan-500/80 tracking-[0.5em] text-sm md:text-base mb-2 uppercase">Tactical Zen Initiated</h2>
          <h1 className="text-6xl md:text-8xl font-bold font-heading tracking-widest text-white drop-shadow-[0_0_15px_rgba(8,217,214,0.5)]">
            ZEN<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600 drop-shadow-[0_0_20px_rgba(8,217,214,0.8)]">DOJO</span>
          </h1>
        </div>

        {/* Menu Options (Video Game Style) */}
        <div className="flex flex-col gap-4 w-full max-w-md">
          {menuItems.map((item, i) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`group relative flex items-center justify-between p-4 bg-navy-900/80 border border-navy-800 hover:${item.border} chamfered-all transition-all duration-300 hover:scale-105 hover:bg-navy-800 ${item.glow}`}
            >
              {/* Scanline hover effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(transparent 50%, rgba(255,255,255,0.5) 50%)', backgroundSize: '100% 4px' }} />
              
              <div className="flex flex-col z-10">
                <span className={`font-heading text-2xl font-bold text-gray-300 group-hover:text-white tracking-wider transition-colors`}>
                  {item.label}
                </span>
                <span className="font-mono text-xs text-gray-500 group-hover:text-cyan-400/80 transition-colors">
                  {item.sub}
                </span>
              </div>

              <div className={`p-2 rounded bg-navy-950 border border-transparent group-hover:${item.border}/30 transition-all z-10`}>
                <item.icon className={`w-8 h-8 ${item.color} opacity-70 group-hover:opacity-100 group-hover:animate-pulse`} />
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer Status */}
      <footer className="absolute bottom-0 w-full py-4 text-center z-10 pointer-events-none">
        <code className="text-[10px] font-mono text-gray-600 tracking-[0.2em]">v1.0.4 [BUILD_ACTIVE] // SECTOR_7G</code>
      </footer>
    </div>
  );
}
