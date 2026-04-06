'use client';

import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { parseYDK } from '@/utils/ydk-parser';
import { fetchCardsByKonamiIds } from '@/app/deck/[id]/actions';
import { useBuilderStore } from '@/store/builder-store';
import { toast } from 'sonner';
import { generateId } from '@/utils/uuid';

export const YdkImportModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [ydkString, setYdkString] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const { loadDeck, versionId } = useBuilderStore();

  const handleImport = async () => {
    if (!ydkString.trim()) return;
    setIsImporting(true);

    try {
      const parsed = parseYDK(ydkString);
      
      const allIds = Array.from(new Set([...parsed.main, ...parsed.extra, ...parsed.side]));
      
      if (allIds.length === 0) {
        toast.error("No valid card IDs found in YDK string.");
        setIsImporting(false);
        return;
      }

      const cardsData = await fetchCardsByKonamiIds(allIds);
      
      const cardMap = new Map();
      cardsData.forEach(c => cardMap.set(c.id, c));

      let importedCount = 0;
      let missingCount = 0;

      const buildZone = (ids: number[], loc: 'main'|'extra'|'side') => {
        const zoneCards: any[] = [];
        ids.forEach(id => {
          const card = cardMap.get(id);
          if (card) {
            zoneCards.push({
              ...card,
              instanceId: generateId(),
              userTag: null,
              location: loc,
              card_id: id // keep reference for save
            });
            importedCount++;
          } else {
            missingCount++;
          }
        });
        return zoneCards;
      };

      const newMain = buildZone(parsed.main, 'main');
      const newExtra = buildZone(parsed.extra, 'extra');
      const newSide = buildZone(parsed.side, 'side');

      loadDeck('temp', versionId, newMain, newExtra, newSide);
      useBuilderStore.setState({ unsavedChanges: true }); // trigger save prompt

      toast.success(`Imported ${importedCount} cards.`);
      if (missingCount > 0) {
        toast.warning(`${missingCount} cards were not found in our database.`);
      }

      onClose();
      setYdkString('');
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse or import YDK.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[150]">
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-navy-900 border border-cyan-500/30 rounded-lg p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="font-heading text-xl font-bold flex items-center gap-2">
              <Upload className="w-5 h-5 text-cyan-500" /> IMPORT YDK
            </Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <p className="text-sm font-mono text-gray-400 mb-4">
            Paste the raw contents of a `.ydk` file below. This will overwrite your current unsaved deck.
          </p>

          <textarea
            value={ydkString}
            onChange={(e) => setYdkString(e.target.value)}
            placeholder="#created by ...&#10;#main&#10;89631139&#10;..."
            className="w-full h-48 bg-navy-950 border border-navy-800 rounded p-3 font-mono text-xs text-gray-300 focus:border-cyan-500 focus:outline-none mb-4 custom-scrollbar"
          />

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isImporting}>CANCEL</Button>
            <Button variant="primary" onClick={handleImport} disabled={isImporting || !ydkString.trim()}>
              {isImporting ? 'IMPORTING...' : 'INITIATE IMPORT'}
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};