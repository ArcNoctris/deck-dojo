'use client';

import React, { useState, useEffect } from 'react';
import { useBuilderStore } from '@/store/builder-store';
import { getDeckVersions, createNewVersion, getDeckCards } from '@/app/deck/[id]/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GitBranch, Plus, ChevronDown, Check, Loader2, X } from 'lucide-react';
import { DeckVersion } from '@/types/database.types';
import { toast } from 'sonner';
import { DeckCard, UserTag } from '@/types/deck';
import { Card } from '@/types/database.types';

export const VersionSelector = ({ deckId }: { deckId: string }) => {
    const { versionId, loadDeck } = useBuilderStore();
    const [versions, setVersions] = useState<DeckVersion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newVersionName, setNewVersionName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isLoadingVersions, setIsLoadingVersions] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoadingVersions(true);
            getDeckVersions(deckId).then(data => {
                setVersions(data);
                setIsLoadingVersions(false);
            });
        }
    }, [isOpen, deckId]);

    // Find current version name
    const currentVersion = versions.find(v => v.id === versionId);
    const currentName = currentVersion?.name || 'Latest';

    const handleSwitchVersion = async (targetVersionId: string) => {
        setIsOpen(false);
        if (targetVersionId === versionId) return;

        const toastId = toast.loading('Switching version...');
        try {
            const result = await getDeckCards(deckId, targetVersionId);
            
            let cardsData: any[] = [];
            let loadedVersionId: string | null = null;

            if (Array.isArray(result)) {
                // Should not happen with updated action, but handle legacy
                cardsData = [];
            } else {
                cardsData = result.cards;
                loadedVersionId = result.versionId || null;
            }

            const mainDeck: DeckCard[] = [];
            const extraDeck: DeckCard[] = [];
            const sideDeck: DeckCard[] = [];

            cardsData.forEach((row: any) => {
                const cardData = row.card as Card;
                const count = row.quantity || 1;
                const tag = row.user_tag as UserTag;
                const location = row.location;

                for (let i = 0; i < count; i++) {
                    const deckCard: DeckCard = {
                        ...cardData,
                        instanceId: crypto.randomUUID(),
                        userTag: tag
                    };

                    if (location === 'main') mainDeck.push(deckCard);
                    else if (location === 'extra') extraDeck.push(deckCard);
                    else if (location === 'side') sideDeck.push(deckCard);
                }
            });

            loadDeck(deckId, loadedVersionId, mainDeck, extraDeck, sideDeck);
            toast.success(`Switched to ${versions.find(v => v.id === targetVersionId)?.name}`, { id: toastId });
        } catch (error) {
            console.error('Failed to switch version', error);
            toast.error('Failed to switch version', { id: toastId });
        }
    };

    const handleCreateVersion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVersionName.trim() || !versionId) return;

        setIsCreating(true);
        try {
            const result = await createNewVersion(deckId, versionId, newVersionName);
            if (result.success) {
                toast.success('New version created');
                setShowCreateModal(false);
                setNewVersionName('');
                // Switch to new version
                handleSwitchVersion(result.versionId);
            }
        } catch (error) {
            console.error('Failed to create version', error);
            toast.error('Failed to create version');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="relative">
            <Button 
                variant="ghost" 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 h-10 px-3 rounded-md border text-xs font-mono transition-all ${isOpen ? 'bg-navy-800 border-cyan-500 text-cyan-400' : 'border-navy-700 text-gray-400 hover:text-cyan-400 hover:bg-navy-800'}`}
            >
                <GitBranch className="w-4 h-4" />
                <span className="hidden sm:inline truncate max-w-[100px]">{currentName}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute left-0 top-full mt-2 w-64 bg-navy-900/95 border border-cyan-500/30 rounded shadow-[0_0_30px_rgba(0,0,0,0.6)] backdrop-blur-md flex flex-col z-20 animate-in fade-in zoom-in duration-200 p-1">
                        <div className="px-2 py-1.5 border-b border-navy-800 mb-1">
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Switch Branch</span>
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-navy-700">
                            {isLoadingVersions ? (
                                <div className="p-4 text-center text-gray-500 text-xs animate-pulse">Loading...</div>
                            ) : (
                                versions.map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => handleSwitchVersion(v.id)}
                                        className={`w-full text-left px-3 py-2 text-xs font-mono rounded flex items-center justify-between ${v.id === versionId ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-300 hover:bg-navy-800'}`}
                                    >
                                        <span className="truncate">{v.name}</span>
                                        {v.id === versionId && <Check className="w-3 h-3" />}
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="border-t border-navy-800 mt-1 pt-1">
                            <button
                                onClick={() => { setIsOpen(false); setShowCreateModal(true); }}
                                className="w-full text-left px-3 py-2 text-xs font-mono rounded flex items-center gap-2 text-cyan-500 hover:bg-cyan-500/10"
                            >
                                <Plus className="w-3 h-3" /> Save New Version
                            </button>
                        </div>
                    </div>
                </>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-navy-900 border border-navy-700 rounded-lg p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="font-heading text-xl text-white mb-4 flex items-center gap-2">
                            <GitBranch className="w-5 h-5 text-cyan-500" />
                            NEW VERSION
                        </h2>
                        <form onSubmit={handleCreateVersion} className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-cyan-500 mb-1">VERSION NAME</label>
                                <Input 
                                    value={newVersionName} 
                                    onChange={(e) => setNewVersionName(e.target.value)} 
                                    required 
                                    placeholder="e.g. v1.1 - Added Handtraps" 
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>CANCEL</Button>
                                <Button type="submit" variant="primary" disabled={isCreating}>
                                    {isCreating ? 'CREATING...' : 'CREATE'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
