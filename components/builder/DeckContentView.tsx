'use client';

import React from 'react';
import Link from 'next/link';
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, useDroppable,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, List, LayoutGrid, ArrowUpDown, Ban } from 'lucide-react';
import { useBuilderStore, SortMethod } from '@/store/builder-store';
import { useDeckValidation } from './hooks/useDeckValidation';
import { useCardPress } from './hooks/useCardPress';
import { DeckCard } from '@/types/deck';
import { computeDominantArchetypeSynergy } from '@/utils/decks/synergy';

type Zone = 'main' | 'extra' | 'side';

interface CardGroup {
  id: number;
  card: DeckCard;
  qty: number;
}

function groupCards(cards: DeckCard[]): CardGroup[] {
  const order: number[] = [];
  const map = new Map<number, CardGroup>();
  cards.forEach((c) => {
    if (!map.has(c.id)) {
      order.push(c.id);
      map.set(c.id, { id: c.id, card: c, qty: 0 });
    }
    map.get(c.id)!.qty++;
  });
  return order.map((id) => map.get(id)!);
}

function typeColor(type: string | null) {
  if (!type) return '#93A4B4';
  if (type.includes('Monster')) return 'var(--color-arcade-amber)';
  if (type.includes('Spell')) return 'var(--color-arcade-green)';
  if (type.includes('Trap')) return 'var(--color-arcade-magenta)';
  return '#93A4B4';
}

function metaLine(card: DeckCard) {
  const isExtra = card.type && (card.type.includes('Fusion') || card.type.includes('Synchro') || card.type.includes('XYZ') || card.type.includes('Link'));
  if (card.type?.includes('Monster')) {
    if (isExtra) return `${card.type.split(' ')[0].toUpperCase()} ${card.linkval ?? ''} · ${card.attribute ?? ''}`.trim();
    return `LV${card.level ?? '?'} · ${card.attribute ?? ''} · ${card.race ?? ''}`;
  }
  return `${card.type?.toUpperCase() ?? ''}`;
}

const NEXT_SORT: Record<SortMethod, SortMethod> = {
  default: 'monster-spell-trap',
  'monster-spell-trap': 'alphabetical',
  alphabetical: 'default',
};

export const DeckContentView = () => {
  const {
    mainDeck, extraDeck, sideDeck, deckViewMode, setDeckViewMode,
    moveGroup, reorderGroup, sortMethod, sortDeck,
  } = useBuilderStore();
  const { warnings, erroredCardIds } = useDeckValidation();
  const removeCard = useBuilderStore((s) => s.removeCard);
  const setActivePreviewCard = useBuilderStore((s) => s.setActivePreviewCard);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const mainGroups = groupCards(mainDeck);
  const extraGroups = groupCards(extraDeck);
  const sideGroups = groupCards(sideDeck);

  const groupsForZone = (zone: Zone) => (zone === 'main' ? mainGroups : zone === 'extra' ? extraGroups : sideGroups);

  const handleTapRemove = (zone: Zone, cardId: number) => {
    const list = zone === 'main' ? mainDeck : zone === 'extra' ? extraDeck : sideDeck;
    const instance = list.find((c) => c.id === cardId);
    if (instance) removeCard(instance.instanceId, zone);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const [activeZone, activeCardIdStr] = activeId.split(':');
    const activeCardId = parseInt(activeCardIdStr, 10);

    let overZone: Zone;
    let overCardId: number | null = null;
    if (overId.startsWith('zonedrop:')) {
      overZone = overId.split(':')[1] as Zone;
    } else {
      const [oz, ocid] = overId.split(':');
      overZone = oz as Zone;
      overCardId = parseInt(ocid, 10);
    }

    if (activeZone === overZone) {
      if (overCardId === null || overCardId === activeCardId) return;
      const ids = groupsForZone(activeZone as Zone).map((g) => g.id);
      const fromIdx = ids.indexOf(activeCardId);
      const toIdx = ids.indexOf(overCardId);
      if (fromIdx < 0 || toIdx < 0) return;
      const newOrder = [...ids];
      newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, activeCardId);
      reorderGroup(activeZone as Zone, newOrder);
    } else {
      moveGroup(activeCardId, activeZone as Zone, overZone);
    }
  };

  const mainCount = mainDeck.length;
  const exCount = extraDeck.length;
  const sideCount = sideDeck.length;

  const { score: synergyScore } = computeDominantArchetypeSynergy(mainDeck);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full">
        <div className="flex-none px-4 pt-3 pb-2 flex items-center justify-between">
          <span className="font-mono font-semibold text-[9px] tracking-wide text-[var(--color-arcade-text-muted)]">
            DRAG TO REORDER · TAP TO REMOVE 1 · HOLD FOR INFO
          </span>
          <div className="flex gap-1.5 flex-none">
            <button
              onClick={() => sortDeck(NEXT_SORT[sortMethod])}
              className="w-[26px] h-[26px] bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-md grid place-items-center text-[var(--color-arcade-text-muted)]"
              title={`Sort: ${sortMethod}`}
            >
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <button
              onClick={() => setDeckViewMode('list')}
              className="w-[26px] h-[26px] rounded-md border border-[var(--color-arcade-border)] grid place-items-center text-[var(--color-arcade-text-muted)]"
              style={{ background: deckViewMode === 'list' ? 'var(--color-arcade-inset)' : 'var(--color-arcade-panel)' }}
            >
              <List className="w-3 h-3" />
            </button>
            <button
              onClick={() => setDeckViewMode('grid')}
              className="w-[26px] h-[26px] rounded-md border border-[var(--color-arcade-border)] grid place-items-center text-[var(--color-arcade-text-muted)]"
              style={{ background: deckViewMode === 'grid' ? 'var(--color-arcade-inset)' : 'var(--color-arcade-panel)' }}
            >
              <LayoutGrid className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto thin-scroll px-4 pb-4 flex flex-col gap-4">
          <ZoneSection
            zone="main"
            label="MAIN DECK"
            count={mainCount}
            max={40}
            labelColor="var(--color-arcade-cyan)"
            groups={mainGroups}
            viewMode={deckViewMode}
            erroredCardIds={erroredCardIds}
            onTapRemove={handleTapRemove}
            onHold={setActivePreviewCard}
          />
          <ZoneSection
            zone="extra"
            label="EXTRA DECK"
            count={exCount}
            max={15}
            labelColor="var(--color-arcade-magenta)"
            groups={extraGroups}
            viewMode={deckViewMode}
            erroredCardIds={erroredCardIds}
            onTapRemove={handleTapRemove}
            onHold={setActivePreviewCard}
          />
          <ZoneSection
            zone="side"
            label="SIDE DECK"
            count={sideCount}
            max={15}
            labelColor="var(--color-arcade-text-muted)"
            groups={sideGroups}
            viewMode={deckViewMode}
            erroredCardIds={erroredCardIds}
            onTapRemove={handleTapRemove}
            onHold={setActivePreviewCard}
            dashed
          />
        </div>

        <div className="flex-none px-4 py-3 border-t border-[var(--color-arcade-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-heading font-bold text-[13px] text-[var(--color-arcade-text)]">
              {mainCount}/40 MAIN <span className="text-[var(--color-arcade-text-muted)] font-semibold">· {exCount} EX</span>
            </span>
            {warnings.length > 0 && (
              <span className="font-heading font-bold text-[11px] text-[var(--color-arcade-red)]">⚠ {warnings.length}</span>
            )}
          </div>
          <Link
            href="./analysis"
            className="h-10 border border-[var(--color-arcade-border)] rounded-lg flex items-center justify-center gap-2"
          >
            <span className="font-heading font-bold text-[11px] tracking-wide text-[var(--color-arcade-cyan)]">SYNERGY {synergyScore}</span>
            <span className="font-heading font-bold text-[11px] tracking-wide text-[var(--color-arcade-text-muted)]">· VIEW FULL ANALYSIS →</span>
          </Link>
        </div>
      </div>
    </DndContext>
  );
};

interface ZoneSectionProps {
  zone: Zone;
  label: string;
  count: number;
  max: number;
  labelColor: string;
  groups: CardGroup[];
  viewMode: 'list' | 'grid';
  erroredCardIds: number[];
  onTapRemove: (zone: Zone, cardId: number) => void;
  onHold: (card: DeckCard) => void;
  dashed?: boolean;
}

const ZoneSection = ({ zone, label, count, max, labelColor, groups, viewMode, erroredCardIds, onTapRemove, onHold, dashed }: ZoneSectionProps) => {
  const { setNodeRef } = useDroppable({ id: `zonedrop:${zone}` });
  const ids = groups.map((g) => `${zone}:${g.id}`);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono font-bold text-[10px] tracking-widest" style={{ color: labelColor }}>
        {label} · {count}/{max}
      </span>
      <SortableContext items={ids} strategy={viewMode === 'list' ? verticalListSortingStrategy : horizontalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={viewMode === 'list' ? 'flex flex-col gap-1.5 min-h-[10px]' : 'grid grid-cols-4 gap-1.5 min-h-[10px]'}
        >
          {groups.map((g) =>
            viewMode === 'list' ? (
              <DeckRowCard
                key={g.id}
                zone={zone}
                group={g}
                isError={erroredCardIds.includes(g.id)}
                onTapRemove={onTapRemove}
                onHold={onHold}
                dashed={dashed}
              />
            ) : (
              <DeckTileCard
                key={g.id}
                zone={zone}
                group={g}
                isError={erroredCardIds.includes(g.id)}
                onTapRemove={onTapRemove}
                onHold={onHold}
              />
            )
          )}
        </div>
      </SortableContext>
      {groups.length === 0 && (
        <div className="h-11 border border-dashed border-[var(--color-arcade-border)] rounded-lg grid place-items-center font-mono text-[10px] text-[var(--color-arcade-text-muted)]/70">
          {zone === 'side' ? 'Drag a card here to side it' : 'Empty'}
        </div>
      )}
    </div>
  );
};

const DeckRowCard = ({ zone, group, isError, onTapRemove, onHold, dashed }: {
  zone: Zone; group: CardGroup; isError: boolean; onTapRemove: (zone: Zone, cardId: number) => void; onHold: (card: DeckCard) => void; dashed?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `${zone}:${group.id}` });
  const press = useCardPress({
    onTap: () => onTapRemove(zone, group.id),
    onHold: () => onHold(group.card),
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderColor: isError ? 'var(--color-arcade-red)' : 'var(--color-arcade-border)' }}
      className={`flex items-center gap-2.5 bg-[var(--color-arcade-panel)] border rounded-[9px] pr-2.5 ${dashed ? 'border-dashed' : ''}`}
    >
      <button {...attributes} {...listeners} className="pl-2 py-2 text-[var(--color-arcade-text-muted)] touch-none cursor-grab active:cursor-grabbing" aria-label="Drag to reorder">
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <div className="w-1.5 h-[30px] rounded-sm flex-none" style={{ background: typeColor(group.card.type) }} />
      <div {...press} className="flex-1 min-w-0 py-2 pl-2.5 cursor-pointer select-none">
        <div className="flex items-center gap-1.5">
          {group.card.ban_status === 'Banned' && <Ban className="w-3 h-3 text-[var(--color-arcade-red)] flex-none" />}
          <div className="font-heading font-bold text-[13px] text-[var(--color-arcade-text)] truncate">{group.card.name}</div>
        </div>
        <div className="font-mono text-[9.5px] text-[var(--color-arcade-text-muted)] mt-0.5 truncate">{metaLine(group.card)}</div>
      </div>
      <div className="min-w-7 h-7 px-2 rounded-md grid place-items-center bg-[var(--color-arcade-inset)] border border-[var(--color-arcade-border)] font-heading font-bold text-xs text-[var(--color-arcade-text)] flex-none">
        ×{group.qty}
      </div>
    </div>
  );
};

const DeckTileCard = ({ zone, group, isError, onTapRemove, onHold }: {
  zone: Zone; group: CardGroup; isError: boolean; onTapRemove: (zone: Zone, cardId: number) => void; onHold: (card: DeckCard) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `${zone}:${group.id}` });
  const press = useCardPress({
    onTap: () => onTapRemove(zone, group.id),
    onHold: () => onHold(group.card),
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderColor: isError ? 'var(--color-arcade-red)' : 'var(--color-arcade-border)' }}
      {...press}
      className="relative aspect-[2/3] rounded-[7px] overflow-hidden border bg-[var(--color-arcade-panel)] select-none cursor-pointer"
    >
      <div className="h-[5px]" style={{ background: typeColor(group.card.type) }} />
      {group.card.image_url_small ? (
        <img src={group.card.image_url_small} alt={group.card.name} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="px-1 py-1 font-heading font-semibold text-[9px] text-[var(--color-arcade-text)] leading-tight">{group.card.name}</div>
      )}
      <div className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 bg-[var(--color-arcade-bg)] border border-[var(--color-arcade-border)] rounded grid place-items-center font-mono font-bold text-[7.5px] text-[var(--color-arcade-text)]">
        ×{group.qty}
      </div>
      <button
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 w-4 h-4 bg-[var(--color-arcade-bg)]/80 border border-[var(--color-arcade-border)] rounded grid place-items-center text-[var(--color-arcade-text-muted)] touch-none cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-2.5 h-2.5" />
      </button>
    </div>
  );
};
