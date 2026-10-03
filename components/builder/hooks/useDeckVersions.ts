'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createNewVersion, getDeckCards, getDeckVersions, saveDeck } from '@/app/deck/[id]/actions';
import { useBuilderStore } from '@/store/builder-store';
import { DeckVersion } from '@/types/database.types';
import { rowsToDeck, toSavedCards } from '@/utils/deck-cards';

export function useDeckVersions(deckId: string) {
  const versionId = useBuilderStore((s) => s.versionId);
  const loadDeck = useBuilderStore((s) => s.loadDeck);
  const [versions, setVersions] = useState<DeckVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setVersions(await getDeckVersions(deckId));
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const switchTo = async (targetId: string) => {
    if (targetId === versionId) return;
    setBusy(true);
    const toastId = toast.loading('Switching version...');
    try {
      const result = await getDeckCards(deckId, targetId);
      const rows = Array.isArray(result) ? [] : result.cards;
      const { main, extra, side } = rowsToDeck(rows);
      loadDeck(deckId, (!Array.isArray(result) && result.versionId) || targetId, main, extra, side);
      toast.success(`Switched to ${versions.find((v) => v.id === targetId)?.name ?? 'version'}`, { id: toastId });
    } catch (error) {
      console.error('Failed to switch version', error);
      toast.error('Failed to switch version', { id: toastId });
    } finally {
      setBusy(false);
    }
  };

  /** Creates a new version containing the current (possibly unsaved) draft and makes it active. */
  const createFromDraft = async (name: string) => {
    if (!versionId) {
      toast.error('Save the deck once before creating versions');
      return false;
    }
    setBusy(true);
    try {
      const { mainDeck, extraDeck, sideDeck } = useBuilderStore.getState();
      const { versionId: newId } = await createNewVersion(deckId, versionId, name);
      await saveDeck(deckId, toSavedCards(mainDeck, extraDeck, sideDeck), newId);
      useBuilderStore.setState({ versionId: newId, unsavedChanges: false });
      await refresh();
      toast.success(`Created ${name}`);
      return true;
    } catch (error) {
      console.error('Failed to create version', error);
      toast.error('Failed to create version');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const current = versions.find((v) => v.id === versionId) ?? null;

  return { versions, current, versionId, loading, busy, refresh, switchTo, createFromDraft };
}
