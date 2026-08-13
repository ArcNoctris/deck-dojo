'use client';

import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { updateDeckMetadata } from '@/app/deck/[id]/actions';

interface DeckSettingsModalProps {
  open: boolean;
  onClose: () => void;
  deckId: string;
  currentName: string;
  currentFormat: string;
}

export const DeckSettingsModal = ({ open, onClose, deckId, currentName, currentFormat }: DeckSettingsModalProps) => {
  const [name, setName] = useState(currentName);
  const [format, setFormat] = useState(currentFormat || 'Advanced');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateDeckMetadata(deckId, name, format);
      toast.success('Deck settings updated');
      onClose();
    } catch (error) {
      console.error('Update failed', error);
      toast.error('Failed to update settings');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[var(--color-arcade-surface)] border border-[var(--color-arcade-border)] rounded-xl p-6 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--color-arcade-text-muted)] hover:text-[var(--color-arcade-text)]">
          <X className="w-5 h-5" />
        </button>
        <h2 className="font-heading font-bold text-xl text-[var(--color-arcade-text)] mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[var(--color-arcade-cyan)]" />
          DECK SETTINGS
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[var(--color-arcade-cyan)] mb-1">DECK NAME</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter deck name..."
              className="w-full bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg px-3 py-2.5 text-[var(--color-arcade-text)] focus:border-[var(--color-arcade-cyan)] focus:outline-none font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-[var(--color-arcade-cyan)] mb-1">FORMAT</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full bg-[var(--color-arcade-panel)] border border-[var(--color-arcade-border)] rounded-lg px-3 py-2.5 text-[var(--color-arcade-text)] focus:border-[var(--color-arcade-cyan)] focus:outline-none font-mono text-sm"
            >
              <option value="Advanced">Advanced</option>
              <option value="Speed">Speed Duel</option>
              <option value="Time Wizard">Time Wizard</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-[var(--color-arcade-border)] mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 font-heading font-bold text-xs text-[var(--color-arcade-text-muted)]">
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-[var(--color-arcade-cyan)] rounded-lg font-heading font-bold text-xs text-[var(--color-arcade-bg)] disabled:opacity-60"
            >
              {isUpdating ? 'SAVING...' : 'SAVE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
