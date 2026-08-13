import Link from 'next/link';
import { ArrowLeft, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[var(--color-arcade-surface)] text-[var(--color-arcade-text)] flex flex-col">
      <div className="flex-none px-4.5 py-5 flex items-center gap-3 border-b border-[var(--color-arcade-border)]">
        <Link
          href="/"
          className="w-[30px] h-[30px] bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg grid place-items-center font-heading font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
        <span className="font-heading font-bold text-[15px] tracking-wide">PROFILE / SETTINGS</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="font-pixel text-[10px] text-[var(--color-arcade-text-muted)]">COMING NEXT</div>
        {user ? (
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2.5 border border-[var(--color-arcade-red)] rounded-lg font-heading font-bold text-xs tracking-wide text-[var(--color-arcade-red)]"
            >
              <LogOut className="w-3.5 h-3.5" /> LOG OUT
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2.5 bg-[var(--color-arcade-cyan)] rounded-lg font-heading font-bold text-xs tracking-wide text-[var(--color-arcade-bg)]"
          >
            SIGN IN
          </Link>
        )}
      </div>
    </div>
  );
}
