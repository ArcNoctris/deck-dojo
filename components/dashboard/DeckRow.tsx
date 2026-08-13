'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from '@headlessui/react';
import { Star, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { DeckListItem } from './DecksListClient';
import { toggleFavoriteDeck, renameDeck, duplicateDeck, archiveDeck, deleteDeck } from '@/app/dashboard/decks/actions';

interface DeckRowProps {
  deck: DeckListItem;
}

export const DeckRow = ({ deck }: DeckRowProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [renaming, setRenaming] = useState(false);
  const [nameValue, setNameValue] = useState(deck.name);

  const commitRename = () => {
    setRenaming(false);
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === deck.name) {
      setNameValue(deck.name);
      return;
    }
    startTransition(async () => {
      await renameDeck(deck.id, trimmed);
      router.refresh();
    });
  };

  const handleToggleFavorite = () => {
    startTransition(async () => {
      await toggleFavoriteDeck(deck.id, !deck.isFavorite);
      router.refresh();
    });
  };

  const handleDuplicate = () => {
    startTransition(async () => {
      await duplicateDeck(deck.id);
      router.refresh();
      toast.success('Deck duplicated');
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      await archiveDeck(deck.id);
      router.refresh();
      toast.success('Deck archived');
    });
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete "${deck.name}"? This removes all its versions and cannot be undone.`)) return;
    startTransition(async () => {
      await deleteDeck(deck.id);
      router.refresh();
      toast.success('Deck deleted');
    });
  };

  return (
    <div
      className="relative bg-[var(--color-arcade-panel)] border rounded-[10px] p-2.5 flex gap-2.5"
      style={{ borderColor: deck.warning ? 'var(--color-arcade-red)' : 'var(--color-arcade-border)', opacity: isPending ? 0.6 : 1 }}
    >
      <a
        href={`/deck/${deck.id}`}
        className="flex-1 flex gap-2.5 min-w-0"
        onClick={e => { if (renaming) e.preventDefault(); }}
      >
        <div
          className="relative w-11 h-[54px] flex-none rounded-md overflow-hidden bg-cover bg-center"
          style={{
            background: deck.coverUrl ? `url(${deck.coverUrl}) center/cover` : deck.color,
            clipPath: 'polygon(6px 0,100% 0,100% 100%,0 100%,0 6px)',
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
          {deck.versionsCount > 1 && (
            <div className="absolute -bottom-1 -right-1 min-w-4 h-4 px-1 bg-[var(--color-arcade-surface)] border border-[var(--color-arcade-border)] rounded grid place-items-center font-mono font-bold text-[8.5px] text-[var(--color-arcade-text-muted)]">
              x{deck.versionsCount}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1.5">
            {renaming ? (
              <input
                autoFocus
                value={nameValue}
                onClick={e => e.preventDefault()}
                onChange={e => setNameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={e => e.key === 'Enter' && commitRename()}
                className="flex-1 min-w-0 bg-[var(--color-arcade-surface)] border border-[var(--color-arcade-cyan)] rounded px-1.5 py-0.5 font-heading font-bold text-sm text-[var(--color-arcade-text)] outline-none"
              />
            ) : (
              <span className="font-heading font-bold text-[15px] text-[var(--color-arcade-text)] whitespace-nowrap overflow-hidden text-ellipsis">
                {deck.name}
              </span>
            )}
            <div className="flex items-center gap-1.5 flex-none">
              <button
                onClick={e => { e.preventDefault(); handleToggleFavorite(); }}
                className="font-heading font-bold text-[13px]"
                style={{ color: deck.isFavorite ? 'var(--color-arcade-amber)' : 'var(--color-arcade-border)' }}
              >
                <Star className="w-3.5 h-3.5" fill={deck.isFavorite ? 'currentColor' : 'none'} />
              </button>
              <Menu as="div" className="relative" onClick={e => e.preventDefault()}>
                <Menu.Button className="text-[var(--color-arcade-text-muted)] px-0.5">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-1 w-36 bg-[var(--color-arcade-surface)] border border-[var(--color-arcade-border)] rounded-lg p-1 flex flex-col gap-0.5 z-10 focus:outline-none">
                  <Menu.Item>
                    <button onClick={() => setRenaming(true)} className="h-8 px-2.5 rounded-md text-left font-heading font-semibold text-[11.5px] text-[var(--color-arcade-text)] hover:bg-[var(--color-arcade-panel)]">
                      Rename
                    </button>
                  </Menu.Item>
                  <Menu.Item>
                    <button onClick={handleDuplicate} className="h-8 px-2.5 rounded-md text-left font-heading font-semibold text-[11.5px] text-[var(--color-arcade-text)] hover:bg-[var(--color-arcade-panel)]">
                      Duplicate
                    </button>
                  </Menu.Item>
                  <Menu.Item>
                    <button onClick={handleArchive} className="h-8 px-2.5 rounded-md text-left font-heading font-semibold text-[11.5px] text-[var(--color-arcade-text)] hover:bg-[var(--color-arcade-panel)]">
                      Archive
                    </button>
                  </Menu.Item>
                  <Menu.Item>
                    <button onClick={handleDelete} className="h-8 px-2.5 rounded-md text-left font-heading font-semibold text-[11.5px] text-[var(--color-arcade-red)] hover:bg-[var(--color-arcade-panel)]">
                      Delete
                    </button>
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            </div>
          </div>

          <div className="font-mono font-semibold text-[9.5px] text-[var(--color-arcade-text-muted)] tracking-wide">
            {deck.mainCount} MAIN · {deck.extraCount} EX · {deck.sideCount} SIDE
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {deck.archetype && (
              <span className="font-mono font-semibold text-[9px] text-[var(--color-arcade-text-muted)] bg-[var(--color-arcade-inset)] rounded px-1.5 py-0.5">
                {deck.archetype}
              </span>
            )}
            <span className="font-mono font-semibold text-[9px] text-[var(--color-arcade-text-muted)]">
              {deck.daysAgo === 0 ? 'TODAY' : `${deck.daysAgo}D AGO`}
            </span>
            {deck.winRate !== null && (
              <span className="font-heading font-bold text-[11px] text-[var(--color-arcade-green)] ml-auto">
                {deck.winRate}%
              </span>
            )}
          </div>

          {deck.warning && (
            <div className="font-mono font-semibold text-[9.5px] text-[var(--color-arcade-red)] mt-0.5">
              ⚠ {deck.warning}
            </div>
          )}
        </div>
      </a>
    </div>
  );
};
