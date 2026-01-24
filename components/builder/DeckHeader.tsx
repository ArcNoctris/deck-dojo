'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Save, Loader2 } from 'lucide-react';
import { useBuilderStore } from '@/store/builder-store';
import { saveDeck, SavedDeckCard } from '@/app/deck/[id]/actions';
import { toast } from 'sonner';

interface DeckHeaderProps {
  deckId: string;
  name: string;
  format: string;
}

export const DeckHeader = ({ deckId, name, format }: DeckHeaderProps) => {
  const { mainDeck, extraDeck, sideDeck, unsavedChanges } = useBuilderStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Group cards for saving
      const allCards = [
        ...mainDeck.map(c => ({ ...c, location: 'main' as const })),
        ...extraDeck.map(c => ({ ...c, location: 'extra' as const })),
        ...sideDeck.map(c => ({ ...c, location: 'side' as const }))
      ];

      const grouped = new Map<string, SavedDeckCard>();

      allCards.forEach(card => {
        // Create unique key based on ID, Location, and Tag
        const key = `${card.id}-${card.location}-${card.userTag || 'null'}`;
        if (grouped.has(key)) {
            const existing = grouped.get(key)!;
            existing.quantity++;
        } else {
            grouped.set(key, {
                card_id: card.id,
                location: card.location,
                quantity: 1,
                user_tag: card.userTag
            });
        }
      });

      await saveDeck(deckId, Array.from(grouped.values()));
      toast.success('Deck saved successfully');
      useBuilderStore.setState({ unsavedChanges: false }); // Reset dirty flag
    } catch (error) {
      console.error('Save failed', error);
      toast.error('Failed to save deck');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <header className="border-b border-navy-800 bg-navy-900/95 backdrop-blur-sm z-30 shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div>
                <h1 className="font-heading text-2xl text-cyan-500 tracking-wider font-bold glow-text-sm uppercase flex items-center gap-2">
                    {name}
                    {unsavedChanges && <span className="w-2 h-2 rounded-full bg-focus-amber animate-pulse" title="Unsaved Changes"></span>}
                </h1>
                <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                    {format || 'UNKNOWN'} OPERATION
                </span>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="font-mono text-xs text-gray-500">SYSTEM ONLINE</span>
                </div>
                
                <Button 
                    variant="primary" 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="flex items-center gap-2 shadow-[0_0_15px_rgba(8,217,214,0.3)]"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'SAVING...' : 'SAVE DECK'}
                </Button>
            </div>
        </div>
      </header>
  );
};
