'use client';

import React from 'react';
import { Drawer } from 'vaul';
import { useBuilderStore } from '@/store/builder-store';
import { UserTag } from '@/types/deck';

const TAGS: UserTag[] = ['starter', 'extender', 'brick', 'engine', 'flex', 'defense', 'hand-trap'];

export const CardPreviewDrawer = () => {
  const { activePreviewCard, setActivePreviewCard, mainDeck, extraDeck, sideDeck, removeCard, setCardTag } = useBuilderStore();

  const isOpen = activePreviewCard !== null;
  const card = activePreviewCard;
  const isRealDeckCard = card && card.instanceId !== 'preview';

  const zone = isRealDeckCard
    ? mainDeck.some(c => c.instanceId === card.instanceId) ? 'main'
    : extraDeck.some(c => c.instanceId === card.instanceId) ? 'extra'
    : sideDeck.some(c => c.instanceId === card.instanceId) ? 'side'
    : null
    : null;

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && setActivePreviewCard(null)}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
        <Drawer.Content className="bg-[var(--color-arcade-surface)] flex flex-col rounded-t-[20px] fixed bottom-0 left-0 right-0 z-[101] border-t border-[var(--color-arcade-cyan)]/30 outline-none max-h-[85vh]">
          <div className="mx-auto w-16 h-1.5 flex-shrink-0 rounded-full bg-[var(--color-arcade-panel)] mt-4 mb-2" />

          {card && (
            <div className="flex flex-col md:flex-row gap-6 p-6 overflow-y-auto">
              <div className="shrink-0 mx-auto md:mx-0 w-48 md:w-64">
                <img
                    src={card.image_url || card.image_url_small || ''}
                    alt={card.name}
                    className="w-full h-auto rounded-lg shadow-[0_0_20px_rgba(25,211,206,0.2)]"
                />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-[var(--color-arcade-text)] mb-1">{card.name}</h2>
                  <div className="text-xs font-mono text-[var(--color-arcade-cyan)] tracking-wider">
                    {card.type} {card.attribute ? `| ${card.attribute}` : ''} {card.level ? `| Level/Rank ${card.level}` : ''}
                  </div>
                </div>

                {(card.atk !== null || card.def !== null) && (
                  <div className="flex gap-4 font-mono text-sm border-y border-[var(--color-arcade-border)] py-2">
                    {card.atk !== null && <div><span className="text-[var(--color-arcade-text-muted)]">ATK/</span> <span className="text-red-400 font-bold">{card.atk}</span></div>}
                    {card.def !== null && <div><span className="text-[var(--color-arcade-text-muted)]">DEF/</span> <span className="text-blue-400 font-bold">{card.def}</span></div>}
                  </div>
                )}

                <div className="bg-[var(--color-arcade-bg)] p-4 rounded-lg border border-[var(--color-arcade-border)]">
                  <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap text-[var(--color-arcade-text-muted)]">
                    {card.description}
                  </p>
                </div>

                {isRealDeckCard && zone && (
                  <div>
                    <div className="text-[10px] font-mono text-[var(--color-arcade-text-muted)] uppercase tracking-widest mb-2">Tag</div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setCardTag(card.instanceId, zone, card.userTag === tag ? null : tag)}
                          className="px-2.5 py-1 rounded-md border font-mono text-[10px] uppercase"
                          style={{
                            borderColor: card.userTag === tag ? 'var(--color-arcade-cyan)' : 'var(--color-arcade-border)',
                            color: card.userTag === tag ? 'var(--color-arcade-cyan)' : 'var(--color-arcade-text-muted)',
                            background: card.userTag === tag ? 'rgba(25,211,206,.12)' : 'transparent',
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => { removeCard(card.instanceId, zone); setActivePreviewCard(null); }}
                      className="h-9 px-4 border border-[var(--color-arcade-red)] rounded-lg font-heading font-bold text-xs text-[var(--color-arcade-red)]"
                    >
                      REMOVE FROM {zone.toUpperCase()}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
