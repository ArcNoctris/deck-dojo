import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Swords, LayoutGrid, Trophy, Boxes, User } from 'lucide-react';
import { StatTile } from '@/components/ui/StatTile';
import { NavCard } from '@/components/ui/NavCard';
import { HomeSplash } from '@/components/dashboard/HomeSplash';
import { getRecentPerformance } from '@/utils/analytics/home-stats';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let displayName = 'DUELIST';
  let deckCount: number | null = null;
  let performance = { winRateLast20: null as number | null, currentWinStreak: 0 };

  if (user) {
    const [{ data: profile }, { count }, perf] = await Promise.all([
      supabase.from('profiles').select('username').eq('id', user.id).single(),
      supabase.from('decks').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      getRecentPerformance(user.id),
    ]);
    if (profile?.username) displayName = profile.username;
    deckCount = count ?? 0;
    performance = perf;
  }

  return (
    <div className="min-h-screen bg-navy-900 text-cyan-50 relative overflow-hidden">
      <HomeSplash />

      {/* Background art + color drift, so the screen isn't flat/monotone */}
      <div
        className="absolute inset-0 bg-cover bg-top opacity-[.55] blur-[1px] scale-105"
        style={{ backgroundImage: "url('/duel/hero-p1.png')" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg,rgba(11,12,16,.55) 0%,rgba(11,12,16,.55) 30%,rgba(11,12,16,.94) 72%,rgba(11,12,16,.98) 100%)' }}
      />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-56 h-56 -left-16 top-16 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--color-cyan-500)', animation: 'arcadeDrift1 14s ease-in-out infinite' }}
        />
        <div
          className="absolute w-44 h-44 -right-12 bottom-32 rounded-full opacity-[.16] blur-3xl"
          style={{ background: 'var(--color-amber-400)', animation: 'arcadeDrift2 17s ease-in-out infinite' }}
        />
      </div>

      <div className="relative max-w-md mx-auto px-5 pt-6 pb-10 flex flex-col gap-8 min-h-screen">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[11px]">
            <div className="relative w-8 h-8">
              <div
                className="absolute w-6 h-6 top-[3px] left-0 bg-navy-950 border border-navy-800 -rotate-[12deg]"
                style={{ clipPath: 'polygon(5px 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%,0 5px)' }}
              />
              <div
                className="absolute w-6 h-6 top-0 left-[5px] grid place-items-center rotate-[9deg]"
                style={{
                  background: 'linear-gradient(135deg,#5FF0EC,var(--color-cyan-500))',
                  boxShadow: '0 0 12px rgba(8,217,214,.55)',
                  clipPath: 'polygon(5px 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%,0 5px)',
                }}
              >
                <div className="w-1.5 h-1.5 bg-navy-900 rotate-45" />
              </div>
            </div>
            <span className="font-heading font-bold text-[15px] tracking-wide uppercase">Deck Dojo</span>
          </div>
          <Link
            href={user ? '/profile' : '/login'}
            className="w-9 h-9 rounded-full border-2 border-cyan-500 p-0.5 grid place-items-center"
            style={{ boxShadow: '0 0 10px rgba(8,217,214,.35)' }}
          >
            <span className="w-full h-full rounded-full bg-navy-950 grid place-items-center">
              <User className="w-4 h-4 text-gray-400" />
            </span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-5">
          <div>
            <div className="font-mono text-[8.5px] text-gray-400 tracking-[0.14em] mb-1.5">
              {user ? 'WELCOME BACK' : 'WELCOME'}
            </div>
            <div className="font-heading font-bold text-[30px] leading-none">{displayName}</div>
          </div>
          <div className="flex gap-2.5">
            <StatTile
              label="WIN RATE"
              value={performance.winRateLast20 ?? '—'}
              unit={performance.winRateLast20 !== null ? '%' : undefined}
              sublabel="last 20"
              color="#10b981"
            />
            <StatTile
              label="STREAK"
              value={performance.currentWinStreak}
              unit="W"
              sublabel="current"
              color="var(--color-amber-400)"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <NavCard href="/duel" label="DUEL" icon={<Swords className="w-[18px] h-[18px]" />} />
          <NavCard
            href="/dashboard/decks"
            label="DECKS"
            icon={<LayoutGrid className="w-[18px] h-[18px]" />}
            meta={deckCount !== null ? `${deckCount} SAVED` : undefined}
          />
          <NavCard href="/arena" label="ARENA" icon={<Trophy className="w-[18px] h-[18px]" />} />
          <NavCard
            href="/collection"
            label="COLLECTION"
            icon={<Boxes className="w-[18px] h-[18px]" />}
            meta="SOON"
            disabled
          />
        </div>

        <code className="text-center text-[9px] font-mono text-gray-600 tracking-[0.2em]">v1.0 // DECK DOJO</code>
      </div>
    </div>
  );
}
