'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Check, Plus, Loader2, FlaskConical, Swords, Upload, Download, Pencil, BarChart3, GitBranch } from 'lucide-react';
import { useDeckVersions } from './hooks/useDeckVersions';

export const FORMATS = ['Advanced', 'Speed', 'Time Wizard'] as const;

interface DeckToolsSheetProps {
  open: boolean;
  onClose: () => void;
  deckId: string;
  format: string;
  unsavedChanges: boolean;
  versions: ReturnType<typeof useDeckVersions>;
  onFormatChange: (format: string) => void;
  onTestHand: () => void;
  onLogMatch: () => void;
  onImport: () => void;
  onExport: () => void;
  onRename: () => void;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="font-mono font-bold text-[10px] tracking-widest text-[var(--color-arcade-cyan)] mb-2">{children}</div>
);

const ToolTile = ({ icon: Icon, label, hint, onClick, accent = 'var(--color-arcade-cyan)' }: {
  icon: React.ElementType; label: string; hint: string; onClick: () => void; accent?: string;
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 p-3 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg text-left active:scale-[0.98] transition hover:border-[var(--color-arcade-cyan)]/60"
  >
    <span className="flex-none w-9 h-9 rounded-md grid place-items-center bg-[var(--color-arcade-inset)]" style={{ color: accent }}>
      <Icon className="w-4 h-4" />
    </span>
    <span className="min-w-0">
      <span className="block font-heading font-bold text-sm tracking-wide text-[var(--color-arcade-text)]">{label}</span>
      <span className="block font-mono text-[10px] text-[var(--color-arcade-text-muted)] truncate">{hint}</span>
    </span>
  </button>
);

export const DeckToolsSheet = ({
  open, onClose, deckId, format, unsavedChanges, versions,
  onFormatChange, onTestHand, onLogMatch, onImport, onExport, onRename,
}: DeckToolsSheetProps) => {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const { refresh } = versions;

  useEffect(() => {
    if (!open) return;
    refresh();
    setConfirmId(null);
    setCreating(false);
    setNewName('');
  }, [open, refresh]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const pickVersion = async (id: string) => {
    if (id === versions.versionId) return;
    if (unsavedChanges && confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setConfirmId(null);
    await versions.switchTo(id);
  };

  const submitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    if (await versions.createFromDraft(name)) {
      setCreating(false);
      setNewName('');
    }
  };

  return (
    <>
      <div className="hidden md:block fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-label="Deck tools"
        className="fixed inset-0 md:left-auto md:w-[420px] md:border-l md:border-[var(--color-arcade-border)] bg-[var(--color-arcade-bg)] z-40 flex flex-col"
      >
        <div className="flex-none px-4 pt-4 flex items-center justify-between">
          <span className="font-mono font-bold text-xs tracking-widest text-[var(--color-arcade-text-muted)]">DECK TOOLS</span>
          <button onClick={onClose} aria-label="Close" className="w-7 h-7 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg grid place-items-center">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto thin-scroll px-4 py-3.5 flex flex-col gap-5">
          {/* VERSION */}
          <section>
            <SectionLabel>VERSION</SectionLabel>
            <div className="bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg overflow-hidden divide-y divide-[var(--color-arcade-border)]">
              {versions.loading && versions.versions.length === 0 ? (
                <div className="p-3 font-mono text-xs text-[var(--color-arcade-text-muted)] animate-pulse">Loading versions…</div>
              ) : (
                versions.versions.map((v) => {
                  const active = v.id === versions.versionId;
                  const confirming = confirmId === v.id;
                  return (
                    <div key={v.id}>
                      <button
                        disabled={versions.busy}
                        onClick={() => pickVersion(v.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left disabled:opacity-60 ${active ? 'bg-[var(--color-arcade-cyan)]/10' : ''}`}
                      >
                        <GitBranch className={`flex-none w-3.5 h-3.5 ${active ? 'text-[var(--color-arcade-cyan)]' : 'text-[var(--color-arcade-text-muted)]'}`} />
                        <span className={`flex-1 min-w-0 truncate font-mono text-xs ${active ? 'text-[var(--color-arcade-cyan)]' : 'text-[var(--color-arcade-text)]'}`}>{v.name}</span>
                        <span className="flex-none font-mono text-[10px] text-[var(--color-arcade-text-muted)]">
                          {v.created_at ? new Date(v.created_at).toLocaleDateString() : ''}
                        </span>
                        {active && <Check className="flex-none w-3.5 h-3.5 text-[var(--color-arcade-cyan)]" />}
                      </button>
                      {confirming && (
                        <div className="px-3 pb-3 flex items-center gap-2">
                          <span className="flex-1 font-mono text-[10px] text-[var(--color-arcade-amber)]">Unsaved changes will be lost.</span>
                          <button onClick={() => setConfirmId(null)} className="px-2.5 py-1.5 font-heading font-bold text-[11px] text-[var(--color-arcade-text-muted)]">CANCEL</button>
                          <button onClick={() => pickVersion(v.id)} className="px-2.5 py-1.5 rounded-md bg-[var(--color-arcade-amber)] font-heading font-bold text-[11px] text-[var(--color-arcade-bg)]">DISCARD &amp; SWITCH</button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {creating ? (
                <form onSubmit={submitNew} className="p-2.5 flex gap-2">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. v1.1 – more hand traps"
                    className="flex-1 min-w-0 bg-[var(--color-arcade-inset)] border border-[var(--color-arcade-cyan)] rounded-md px-2.5 py-2 font-mono text-xs text-[var(--color-arcade-text)] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newName.trim() || versions.busy}
                    className="flex-none px-3 rounded-md bg-[var(--color-arcade-cyan)] font-heading font-bold text-xs text-[var(--color-arcade-bg)] disabled:opacity-50"
                  >
                    {versions.busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'CREATE'}
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setCreating(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 font-mono text-xs text-[var(--color-arcade-cyan)]"
                >
                  <Plus className="w-3.5 h-3.5" /> Save current deck as new version
                </button>
              )}
            </div>
          </section>

          {/* FORMAT */}
          <section>
            <SectionLabel>FORMAT</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {FORMATS.map((f) => {
                const active = f === format;
                return (
                  <button
                    key={f}
                    onClick={() => onFormatChange(f)}
                    className={`px-3.5 h-9 rounded-full border font-heading font-bold text-xs tracking-wide transition ${
                      active
                        ? 'bg-[var(--color-arcade-cyan)] border-[var(--color-arcade-cyan)] text-[var(--color-arcade-bg)]'
                        : 'bg-[var(--color-arcade-panel)] border-[var(--color-arcade-border)] text-[var(--color-arcade-text)]'
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </section>

          {/* PLAY */}
          <section>
            <SectionLabel>PLAY</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ToolTile icon={FlaskConical} label="TEST HAND" hint="Draw opening hands" onClick={onTestHand} />
              <ToolTile icon={Swords} label="LOG MATCH" hint="Record a result" onClick={onLogMatch} accent="var(--color-arcade-magenta)" />
            </div>
          </section>

          {/* FILE */}
          <section>
            <SectionLabel>FILE</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ToolTile icon={Upload} label="IMPORT YDK" hint="Replace with a .ydk list" onClick={onImport} accent="var(--color-arcade-purple)" />
              <ToolTile icon={Download} label="EXPORT YDK" hint="Download for EDOPro / Omega" onClick={onExport} accent="var(--color-arcade-purple)" />
            </div>
          </section>

          {/* DECK */}
          <section>
            <SectionLabel>DECK</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ToolTile icon={Pencil} label="RENAME" hint="Edit the deck name" onClick={onRename} accent="var(--color-arcade-amber)" />
              <Link
                href={`/deck/${deckId}/analysis`}
                className="flex items-center gap-3 p-3 bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg hover:border-[var(--color-arcade-cyan)]/60"
              >
                <span className="flex-none w-9 h-9 rounded-md grid place-items-center bg-[var(--color-arcade-inset)] text-[var(--color-arcade-green)]">
                  <BarChart3 className="w-4 h-4" />
                </span>
                <span className="min-w-0">
                  <span className="block font-heading font-bold text-sm tracking-wide text-[var(--color-arcade-text)]">OPEN ANALYSIS</span>
                  <span className="block font-mono text-[10px] text-[var(--color-arcade-text-muted)] truncate">Odds, breakdown, synergy</span>
                </span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};
