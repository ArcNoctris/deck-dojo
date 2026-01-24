import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LayoutGrid, Swords, Database } from 'lucide-react';
import { CyberCard } from '@/components/ui/CyberCard';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profileName = "Duelist";
  if (user) {
      const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
      if (profile?.username) profileName = profile.username;
  }

  return (
    <div className="flex min-h-screen flex-col bg-navy-950 text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gradient-to-b from-navy-900 to-navy-950 border-b border-navy-800">
        <h1 className="text-6xl md:text-7xl font-bold font-heading text-white tracking-wider mb-6 glow-text">
          ZEN <span className="text-cyan-500">DECKDOJO</span>
        </h1>
        <p className="text-xl md:text-2xl text-cyan-500/80 font-mono mb-8 tracking-widest uppercase">
          Tactical Zen Initiated
        </p>
        
        <div className="bg-navy-800/50 border border-cyan-500/30 px-6 py-3 rounded-full mb-12 backdrop-blur-sm">
          <p className="font-heading text-lg tracking-wide">
            WELCOME BACK, <span className="text-cyan-400 font-bold">{profileName}</span>
          </p>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="flex-1 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Deck Editor */}
          <Link href="/dashboard" className="group">
            <CyberCard className="h-64 flex flex-col items-center justify-center gap-6 group-hover:bg-navy-800/80 transition-all duration-300 border-cyan-500/30 group-hover:border-cyan-500 shadow-[0_0_20px_rgba(8,217,214,0.1)] group-hover:shadow-[0_0_30px_rgba(8,217,214,0.3)]">
              <div className="p-4 rounded-full bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                <LayoutGrid className="w-12 h-12 text-cyan-500" />
              </div>
              <div className="text-center">
                <h3 className="font-heading text-2xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">DECK EDITOR</h3>
                <p className="text-gray-400 font-mono text-sm px-8">Construct your arsenal with precision.</p>
              </div>
            </CyberCard>
          </Link>

          {/* Duel Mode */}
          <Link href="/duel" className="group">
            <CyberCard className="h-64 flex flex-col items-center justify-center gap-6 group-hover:bg-navy-800/80 transition-all duration-300 border-strike-red/30 group-hover:border-strike-red shadow-[0_0_20px_rgba(255,42,109,0.1)] group-hover:shadow-[0_0_30px_rgba(255,42,109,0.3)]">
              <div className="p-4 rounded-full bg-strike-red/10 group-hover:bg-strike-red/20 transition-colors">
                <Swords className="w-12 h-12 text-strike-red" />
              </div>
              <div className="text-center">
                <h3 className="font-heading text-2xl font-bold mb-2 group-hover:text-strike-red transition-colors">DUEL MODE</h3>
                <p className="text-gray-400 font-mono text-sm px-8">Test your strategy in combat simulations.</p>
              </div>
            </CyberCard>
          </Link>

          {/* Knowledge Base */}
          <Link href="/cards" className="group">
            <CyberCard className="h-64 flex flex-col items-center justify-center gap-6 group-hover:bg-navy-800/80 transition-all duration-300 border-focus-amber/30 group-hover:border-focus-amber shadow-[0_0_20px_rgba(255,200,87,0.1)] group-hover:shadow-[0_0_30px_rgba(255,200,87,0.3)]">
              <div className="p-4 rounded-full bg-focus-amber/10 group-hover:bg-focus-amber/20 transition-colors">
                <Database className="w-12 h-12 text-focus-amber" />
              </div>
              <div className="text-center">
                <h3 className="font-heading text-2xl font-bold mb-2 group-hover:text-focus-amber transition-colors">KNOWLEDGE BASE</h3>
                <p className="text-gray-400 font-mono text-sm px-8">Access the complete archive of cards.</p>
              </div>
            </CyberCard>
          </Link>

        </div>
      </section>

      {/* Footer Status */}
      <footer className="py-6 text-center border-t border-navy-800 bg-navy-950">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-navy-900 border border-navy-800">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <code className="text-xs font-mono text-gray-500">SYSTEM STATUS: OPERATIONAL</code>
        </div>
      </footer>
    </div>
  );
}
