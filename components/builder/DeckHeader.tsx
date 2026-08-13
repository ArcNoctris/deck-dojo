'use client';

import React, { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, Save, Loader2, Settings, ArrowLeft, Upload } from 'lucide-react';
import { Fragment } from 'react';
import Link from 'next/link';
import { useBuilderStore } from '@/store/builder-store';
import { saveDeck, SavedDeckCard, updateDeckMetadata } from '@/app/deck/[id]/actions';
import { toast } from 'sonner';
import { DeckSettingsModal } from './DeckSettingsModal';
import { TestHandModal } from '@/components/simulation/TestHandModal';
import { VersionSelector } from './VersionSelector';
import { MatchLoggerModal } from '@/components/arena/MatchLoggerModal';
import { YdkImportModal } from './YdkImportModal';

interface DeckHeaderProps {
  deckId: string;
  name: string;
  format: string;
}

export const DeckHeader = ({ deckId, name, format }: DeckHeaderProps) => {
  const { mainDeck, extraDeck, sideDeck, unsavedChanges, versionId, builderTab, setBuilderTab } = useBuilderStore();
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(name);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const allCards = [
        ...mainDeck.map(c => ({ ...c, location: 'main' as const })),
        ...extraDeck.map(c => ({ ...c, location: 'extra' as const })),
        ...sideDeck.map(c => ({ ...c, location: 'side' as const }))
      ];

      const grouped = new Map<string, SavedDeckCard>();
      allCards.forEach(card => {
        const key = `${card.id}-${card.location}-${card.userTag || 'null'}`;
        if (grouped.has(key)) {
          grouped.get(key)!.quantity++;
        } else {
          grouped.set(key, { card_id: card.id, location: card.location, quantity: 1, user_tag: card.userTag });
        }
      });

      await saveDeck(deckId, Array.from(grouped.values()), versionId || undefined);
      toast.success('Deck saved successfully');
      useBuilderStore.setState({ unsavedChanges: false });
    } catch (error) {
      console.error('Save failed', error);
      toast.error('Failed to save deck');
    } finally {
      setIsSaving(false);
    }
  };

  const commitNameEdit = async () => {
    setEditingName(false);
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === name) {
      setNameValue(name);
      return;
    }
    try {
      await updateDeckMetadata(deckId, trimmed, format);
    } catch {
      toast.error('Failed to rename deck');
      setNameValue(name);
    }
  };

  return (
    <>
      <header className="flex-none bg-[var(--color-arcade-surface)] border-b border-[var(--color-arcade-border)]">
        <div className="px-4 pt-4 pb-2.5 flex items-center gap-2.5">
          <Link
            href="/dashboard/decks"
            className="flex-none w-7 h-7 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg grid place-items-center"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[var(--color-arcade-text)]" />
          </Link>

          {editingName ? (
            <input
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={commitNameEdit}
              onKeyDown={(e) => e.key === 'Enter' && commitNameEdit()}
              className="flex-1 min-w-0 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-cyan)] rounded-md px-2 py-1 font-heading font-bold text-[15px] text-[var(--color-arcade-text)] outline-none"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex-1 min-w-0 flex items-center gap-1.5 font-heading font-bold text-[15px] tracking-wide uppercase text-[var(--color-arcade-text)] text-left truncate"
            >
              <span className="truncate">{name}</span>
              {unsavedChanges && <span className="flex-none w-1.5 h-1.5 rounded-full bg-[var(--color-arcade-amber)]" title="Unsaved changes" />}
            </button>
          )}

          <Menu as="div" className="relative flex-none">
            <Menu.Button className="w-8 h-8 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg grid place-items-center text-[var(--color-arcade-text-muted)]">
              <MoreVertical className="w-4 h-4" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 rounded-lg bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] shadow-lg divide-y divide-[var(--color-arcade-border)] focus:outline-none z-30">
                <div className="p-1">
                  <Menu.Item>
                    {({ active }) => (
                      <div className={`p-1 rounded-md ${active ? 'bg-[var(--color-arcade-surface)]' : ''}`}>
                        <VersionSelector deckId={deckId} />
                      </div>
                    )}
                  </Menu.Item>
                </div>
                <div className="p-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setShowImport(true)}
                        className={`${active ? 'bg-[var(--color-arcade-surface)] text-[var(--color-arcade-cyan)]' : 'text-[var(--color-arcade-text)]'} group flex w-full items-center rounded-md px-2 py-2 text-xs font-mono`}
                      >
                        <Upload className="mr-2 h-4 w-4" /> IMPORT YDK
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <div className={`rounded-md ${active ? 'bg-[var(--color-arcade-surface)]' : ''} flex items-center px-2 py-1`}>
                        <MatchLoggerModal deckId={deckId} deckVersionId={versionId || ''} />
                      </div>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <div className={`rounded-md ${active ? 'bg-[var(--color-arcade-surface)]' : ''} flex items-center px-2 py-1`}>
                        <TestHandModal deckId={deckId} />
                      </div>
                    )}
                  </Menu.Item>
                </div>
                <div className="p-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setShowSettings(true)}
                        className={`${active ? 'bg-[var(--color-arcade-surface)] text-[var(--color-arcade-cyan)]' : 'text-[var(--color-arcade-text)]'} group flex w-full items-center rounded-md px-2 py-2 text-xs font-mono`}
                      >
                        <Settings className="mr-2 h-4 w-4" /> SETTINGS
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-none w-8 h-8 bg-[var(--color-arcade-cyan)] rounded-lg grid place-items-center text-[var(--color-arcade-bg)] disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </button>
        </div>

        <div className="px-4 pb-3 flex bg-[var(--color-arcade-panel)] rounded-lg p-[3px] mx-4 gap-[3px]">
          <button
            onClick={() => setBuilderTab('deck')}
            className="flex-1 h-[30px] rounded-md font-heading font-bold text-xs tracking-wide"
            style={{ background: builderTab === 'deck' ? 'var(--color-arcade-inset)' : 'transparent', color: 'var(--color-arcade-text)' }}
          >
            DECK
          </button>
          <button
            onClick={() => setBuilderTab('search')}
            className="flex-1 h-[30px] rounded-md font-heading font-bold text-xs tracking-wide"
            style={{ background: builderTab === 'search' ? 'var(--color-arcade-inset)' : 'transparent', color: 'var(--color-arcade-text)' }}
          >
            SEARCH
          </button>
        </div>
      </header>

      <DeckSettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        deckId={deckId}
        currentName={name}
        currentFormat={format}
      />
      <YdkImportModal open={showImport} onClose={() => setShowImport(false)} />
    </>
  );
};
