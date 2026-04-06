'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, Save, Loader2, Settings, X, Edit2, ChevronLeft, Upload } from 'lucide-react';
import { Fragment } from 'react';
import Link from 'next/link';
import { useBuilderStore } from '@/store/builder-store';
import { saveDeck, SavedDeckCard, updateDeckMetadata } from '@/app/deck/[id]/actions';
import { toast } from 'sonner';
import { Input } from '@/components/ui/Input';
import { DeckSettings } from './DeckSettings';
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
  const { mainDeck, extraDeck, sideDeck, unsavedChanges, versionId } = useBuilderStore();
  const [isSaving, setIsSaving] = useState(false);
  
  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [newName, setNewName] = useState(name);
  const [newFormat, setNewFormat] = useState(format || 'Advanced');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showImport, setShowImport] = useState(false);

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

      await saveDeck(deckId, Array.from(grouped.values()), versionId || undefined);
      toast.success('Deck saved successfully');
      useBuilderStore.setState({ unsavedChanges: false }); // Reset dirty flag
    } catch (error) {
      console.error('Save failed', error);
      toast.error('Failed to save deck');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMetadata = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsUpdating(true);
      try {
          await updateDeckMetadata(deckId, newName, newFormat);
          toast.success('Deck settings updated');
          setShowSettings(false);
      } catch (error) {
          console.error('Update failed', error);
          toast.error('Failed to update settings');
      } finally {
          setIsUpdating(false);
      }
  };

  return (
    <>
        <header className="border-b border-navy-800 bg-navy-900/95 backdrop-blur-sm z-30 shrink-0">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" title="Back to Dashboard">
                        <Button variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-cyan-400">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-heading text-2xl text-cyan-500 tracking-wider font-bold glow-text-sm uppercase flex items-center gap-2">
                            {name}
                            {unsavedChanges && <span className="w-2 h-2 rounded-full bg-focus-amber animate-pulse" title="Unsaved Changes"></span>}
                        </h1>
                        <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                            {format || 'UNKNOWN'} OPERATION
                        </span>
                    </div>
                    <Button variant="ghost" onClick={() => setShowSettings(true)} className="h-8 w-8 p-0 text-gray-500 hover:text-cyan-400">
                        <Edit2 className="w-4 h-4" />
                    </Button>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="hidden lg:flex items-center gap-2 mr-4">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="font-mono text-xs text-gray-500">SYSTEM ONLINE</span>
                    </div>

                    <Menu as="div" className="relative inline-block text-left z-50">
                        <div>
                            <Menu.Button className="flex items-center justify-center w-10 h-10 rounded-md bg-navy-800 text-gray-400 hover:text-cyan-400 hover:bg-navy-700 transition-colors border border-navy-700 hover:border-cyan-500/50">
                                <MoreVertical className="w-5 h-5" />
                            </Menu.Button>
                        </div>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-navy-700 rounded-md bg-navy-800 border border-cyan-500/30 shadow-lg ring-1 ring-black/5 focus:outline-none">
                                <div className="px-1 py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <div className={`p-1 rounded-md ${active ? 'bg-navy-700' : ''}`}>
                                                <VersionSelector deckId={deckId} />
                                            </div>
                                        )}
                                    </Menu.Item>
                                </div>
                                <div className="px-1 py-1">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => setShowImport(true)}
                                                className={`${
                                                    active ? 'bg-navy-700 text-cyan-400' : 'text-gray-300'
                                                } group flex w-full items-center rounded-md px-2 py-2 text-xs font-mono`}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                IMPORT YDK
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <div className={`rounded-md ${active ? 'bg-navy-700' : ''} flex items-center justify-start px-2 py-1`}>
                                                <MatchLoggerModal deckId={deckId} deckVersionId={versionId || ''} />
                                            </div>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <div className={`rounded-md ${active ? 'bg-navy-700' : ''} flex items-center justify-start px-2 py-1`}>
                                                <TestHandModal deckId={deckId} />
                                            </div>
                                        )}
                                    </Menu.Item>
                                </div>
                                <div className="px-1 py-1">
                                     <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={() => setShowSettings(true)}
                                                className={`${
                                                    active ? 'bg-navy-700 text-cyan-400' : 'text-gray-300'
                                                } group flex w-full items-center rounded-md px-2 py-2 text-xs font-mono`}
                                            >
                                                <Settings className="mr-2 h-4 w-4" />
                                                SETTINGS
                                            </button>
                                        )}
                                    </Menu.Item>
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>

                    <Button 
                        variant="primary" 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="flex items-center gap-2 h-10 px-6 rounded-md shadow-[0_0_15px_rgba(8,217,214,0.3)] font-bold tracking-wider ml-2"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'SAVING...' : 'SAVE'}
                    </Button>
                </div>
            </div>
        </header>

        {/* Settings Modal */}
        {showSettings && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-navy-900 border border-navy-700 rounded-lg p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
                    <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="font-heading text-xl text-white mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-cyan-500" />
                        DECK SETTINGS
                    </h2>
                    <form onSubmit={handleUpdateMetadata} className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono text-cyan-500 mb-1">DECK NAME</label>
                            <Input value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="Enter deck name..." />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-cyan-500 mb-1">FORMAT</label>
                            <select 
                                value={newFormat} 
                                onChange={(e) => setNewFormat(e.target.value)}
                                className="w-full bg-navy-900 border border-navy-700 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none font-mono text-sm"
                            >
                                <option value="Advanced">Advanced</option>
                                <option value="Speed">Speed Duel</option>
                                <option value="Time Wizard">Time Wizard</option>
                            </select>
                        </div>
                        <div className="pt-4 flex justify-end gap-2 border-t border-navy-800 mt-6">
                            <Button type="button" variant="ghost" onClick={() => setShowSettings(false)}>CANCEL</Button>
                            <Button type="submit" variant="primary" disabled={isUpdating}>
                                {isUpdating ? 'SAVING...' : 'SAVE METADATA'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* YDK Import Modal */}
        <YdkImportModal open={showImport} onClose={() => setShowImport(false)} />
    </>
  );
};
