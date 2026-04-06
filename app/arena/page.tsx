import { getMetaReport } from '@/app/arena/actions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Trophy, Activity, ShieldAlert, Users } from 'lucide-react';
import { MetaChart } from '@/components/arena/MetaChart';

export default async function GlobalArenaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const metaData = await getMetaReport();
  const totalLoggedMatches = metaData.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h2 className="text-sm font-mono text-cyan-500 tracking-[0.3em] mb-2 uppercase">Global Data Feed</h2>
        <h1 className="text-5xl font-heading font-bold flex items-center justify-center gap-4 glow-text">
          <Trophy className="w-10 h-10 text-focus-amber" />
          THE ARENA
        </h1>
        <p className="text-gray-400 font-mono mt-4">Meta-Game Tracking & Aggregated Combat Logs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-navy-900 border border-navy-800 p-6 rounded-xl text-center">
          <Activity className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
          <div className="text-xs font-mono text-gray-500 mb-1">TOTAL MATCHES LOGGED</div>
          <div className="text-4xl font-heading font-bold">{totalLoggedMatches}</div>
        </div>
        <div className="bg-navy-900 border border-navy-800 p-6 rounded-xl text-center">
          <ShieldAlert className="w-8 h-8 text-strike-red mx-auto mb-2" />
          <div className="text-xs font-mono text-gray-500 mb-1">MOST FACED THREAT</div>
          <div className="text-2xl font-heading font-bold text-strike-red truncate">
            {metaData.length > 0 ? metaData[0].deck : 'N/A'}
          </div>
        </div>
        <div className="bg-navy-900 border border-navy-800 p-6 rounded-xl text-center">
          <Users className="w-8 h-8 text-focus-amber mx-auto mb-2" />
          <div className="text-xs font-mono text-gray-500 mb-1">ACTIVE DUELISTS</div>
          <div className="text-4xl font-heading font-bold">1</div>
        </div>
      </div>

      <div className="bg-navy-900 border border-cyan-500/30 rounded-xl p-6 shadow-[0_0_20px_rgba(8,217,214,0.1)]">
        <h2 className="font-heading text-2xl mb-6 border-b border-navy-800 pb-4">GLOBAL THREAT ASSESSMENT (META FREQUENCY)</h2>
        {metaData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80">
               <MetaChart data={metaData} />
            </div>
            <div>
              <table className="w-full text-left font-mono text-sm">
                <thead>
                  <tr className="border-b border-navy-800 text-gray-500">
                    <th className="pb-3">ARCHETYPE</th>
                    <th className="pb-3 text-right">ENCOUNTERS</th>
                    <th className="pb-3 text-right">WIN RATE VS USERS</th>
                  </tr>
                </thead>
                <tbody>
                  {metaData.slice(0, 8).map((meta, i) => (
                    <tr key={i} className="border-b border-navy-800/50 hover:bg-navy-800 transition-colors">
                      <td className="py-4 font-bold text-cyan-400">{meta.deck}</td>
                      <td className="py-4 text-right">{meta.total}</td>
                      <td className={`py-4 text-right font-bold ${meta.winRate > 50 ? 'text-strike-red' : 'text-green-500'}`}>
                        {meta.winRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 font-mono border border-dashed border-navy-700 rounded-lg">
            INSUFFICIENT DATA POINTS FOR THREAT ASSESSMENT
          </div>
        )}
      </div>
    </div>
  );
}