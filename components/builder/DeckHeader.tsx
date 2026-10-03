'use client';

import React, { useCallback, useState } from 'react';
import { MoreHorizontal, Save, Loader2, ArrowLeft, FlaskConical, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useBuilderStore } from '@/store/builder-store';
import { saveDeck, updateDeckMetadata } from '@/app/deck/[id]/actions';
import { toast } from 'sonner';
import { TestHandModal } from '@/components/simulation/TestHandModal';
import { MatchLoggerModal } from '@/components/arena/MatchLoggerModal';
import { YdkImportModal } from './YdkImportModal';
import { DeckToolsSheet } from './DeckToolsSheet';
import { useDeckVersions } from './hooks/useDeckVersions';
import { buildYDK } from '@/utils/ydk-parser';
import { toSavedCards } from '@/utils/deck-cards';

interface DeckHeaderProps {
  deckId: string;
  name: string;
  format: string;
}

type Dialog = 'tools' | 'testHand' | 'logMatch' | 'import' | null;

export const DeckHeader = ({ deckId, name, format }: DeckHeaderProps) => {
  const { mainDeck, extraDeck, sideDeck, unsavedChanges, versionId, builderTab, setBuilderTab } = useBuilderStore();
  const versions = useDeckVersions(deckId);
  const [isSaving, setIsSaving] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(name);
  const [formatValue, setFormatValue] = useState(format);

  const closeDialog = useCallback(() => setDialog(null), []);
  // Only one dialog is open at a time, so switching replaces the sheet.
  const openFromSheet = (target: Exclude<Dialog, 'tools' | null>) => setDialog(target);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveDeck(deckId, toSavedCards(mainDeck, extraDeck, sideDeck), versionId || undefined);
      toast.success('Deck saved successfully');
      useBuilderStore.setState({ unsavedChanges: false });
    } catch (error) {
      console.error('Save failed', error);
      toast.error('Failed to save deck');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const ydk = buildYDK(
      mainDeck.map((c) => c.id),
      extraDeck.map((c) => c.id),
      sideDeck.map((c) => c.id)
    );
    const blob = new Blob([ydk], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nameValue.trim().replace(/[^a-z0-9_-]+/gi, '_') || 'deck'}.ydk`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('YDK downloaded');
  };

  const handleFormatChange = async (next: string) => {
    if (next === formatValue) return;
    const prev = formatValue;
    setFormatValue(next);
    try {
      await updateDeckMetadata(deckId, nameValue, next);
      toast.success(`Format set to ${next}`);
    } catch {
      setFormatValue(prev);
      toast.error('Failed to update format');
    }
  };

  const commitNameEdit = async () => {
    setEditingName(false);
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === name) {
      setNameValue(name);
      return;
    }
    setNameValue(trimmed);
    try {
      await updateDeckMetadata(deckId, trimmed, formatValue);
    } catch {
      toast.error('Failed to rename deck');
      setNameValue(name);
    }
  };

  const iconBtn = 'flex-none w-8 h-8 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg grid place-items-center text-[var(--color-arcade-text-muted)] hover:text-[var(--color-arcade-cyan)] transition-colors';

  return (
    <>
      <header className="flex-none bg-[var(--color-arcade-surface)] border-b border-[var(--color-arcade-border)]">
        <div className="px-4 pt-4 pb-2.5 flex items-center gap-2">
          <Link
            href="/dashboard/decks"
            aria-label="Back to decks"
            className="flex-none w-7 h-7 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg grid place-items-center"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[var(--color-arcade-text)]" />
          </Link>

          <div className="flex-1 min-w-0 pl-0.5">
            {editingName ? (
              <input
                autoFocus
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={commitNameEdit}
                onKeyDown={(e) => e.key === 'Enter' && commitNameEdit()}
                className="w-full bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-cyan)] rounded-md px-2 py-0.5 font-heading font-bold text-[15px] text-[var(--color-arcade-text)] outline-none"
              />
            ) : (
              <button
                onClick={() => setEditingName(true)}
                className="max-w-full flex items-center gap-1.5 font-heading font-bold text-[15px] leading-tight tracking-wide uppercase text-[var(--color-arcade-text)] text-left"
              >
                <span className="truncate">{nameValue}</span>
                {unsavedChanges && <span className="flex-none w-1.5 h-1.5 rounded-full bg-[var(--color-arcade-amber)]" title="Unsaved changes" />}
              </button>
            )}
            <button
              onClick={() => setDialog('tools')}
              className="max-w-full flex items-center gap-1 font-mono text-[10px] tracking-wider text-[var(--color-arcade-text-muted)] hover:text-[var(--color-arcade-cyan)]"
            >
              <span className="truncate">
                <span className="text-[var(--color-arcade-cyan)]">{versions.current?.name ?? '—'}</span>
                {' · '}
                {formatValue.toUpperCase()}
              </span>
              <ChevronDown className="flex-none w-3 h-3" />
            </button>
          </div>

          <button onClick={() => setDialog('testHand')} aria-label="Test hand" title="Test hand" className={iconBtn}>
            <FlaskConical className="w-4 h-4" />
          </button>
          <button onClick={() => setDialog('tools')} aria-label="Deck tools" title="Deck tools" className={iconBtn}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            aria-label="Save deck"
            title="Save deck"
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

      <DeckToolsSheet
        open={dialog === 'tools'}
        onClose={closeDialog}
        deckId={deckId}
        format={formatValue}
        unsavedChanges={unsavedChanges}
        versions={versions}
        onFormatChange={handleFormatChange}
        onTestHand={() => openFromSheet('testHand')}
        onLogMatch={() => openFromSheet('logMatch')}
        onImport={() => openFromSheet('import')}
        onExport={handleExport}
        onRename={() => {
          setDialog(null);
          setEditingName(true);
        }}
      />
      <TestHandModal deckId={deckId} open={dialog === 'testHand'} onOpenChange={(o) => setDialog(o ? 'testHand' : null)} />
      <MatchLoggerModal
        deckId={deckId}
        deckVersionId={versionId || ''}
        open={dialog === 'logMatch'}
        onOpenChange={(o) => setDialog(o ? 'logMatch' : null)}
      />
      <YdkImportModal open={dialog === 'import'} onClose={closeDialog} />
    </>
  );
};
