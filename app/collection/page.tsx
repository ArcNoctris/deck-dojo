import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CollectionPage() {
  return (
    <div className="min-h-screen bg-[var(--color-arcade-surface)] text-[var(--color-arcade-text)] flex flex-col">
      <div className="flex-none px-4.5 py-5 flex items-center gap-3 border-b border-[var(--color-arcade-border)]">
        <Link
          href="/"
          className="w-[30px] h-[30px] bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg grid place-items-center font-heading font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
        <span className="font-heading font-bold text-[15px] tracking-wide">COLLECTION</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-8 text-center">
        <div className="font-pixel text-[10px] text-[var(--color-arcade-text-muted)]">NOT IN MVP</div>
        <div className="font-mono text-xs text-[var(--color-arcade-text-muted)] leading-relaxed max-w-[220px]">
          Planned for a later release.
        </div>
      </div>
    </div>
  );
}
