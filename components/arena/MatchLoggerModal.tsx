'use client';

import React, { useState } from 'react';
import { Drawer } from 'vaul';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Swords, Trophy, Skull, Minus, ChevronRight, ChevronDown } from 'lucide-react';
import { logMatch } from '@/app/arena/actions';
import { toast } from 'sonner';

interface MatchLoggerModalProps {
  deckId: string;
  deckVersionId: string;
}

export const MatchLoggerModal = ({ deckId, deckVersionId }: MatchLoggerModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [opponentDeck, setOpponentDeck] = useState('');
  const [goingFirst, setGoingFirst] = useState(true);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLog = async (result: 'win' | 'loss' | 'draw') => {
    if (!deckVersionId) {
        toast.error('No active deck version found. Please save the deck first.');
        return;
    }
    if (!opponentDeck.trim()) {
        toast.error('Please enter opponent deck');
        return;
    }

    setIsSubmitting(true);
    try {
      await logMatch({
        deck_id: deckId,
        deck_version_id: deckVersionId,
        opponent_deck: opponentDeck,
        result,
        going_first: goingFirst,
        notes: notes.trim() || undefined
      });
      toast.success('Match Recorded');
      setIsOpen(false);
      // Reset form
      setOpponentDeck('');
      setNotes('');
      setGoingFirst(true);
    } catch (error) {
      console.error(error);
      toast.error('Failed to log match');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Trigger asChild>
        <Button 
            variant="ghost" 
            className="text-strike-red hover:text-strike-red hover:bg-strike-red/10 h-10 px-3"
            title="Log Match Result"
        >
            <Swords className="w-5 h-5" />
            <span className="hidden sm:inline ml-2 text-xs font-heading tracking-wider">LOG MATCH</span>
        </Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-navy-900 flex flex-col rounded-t-[20px] fixed bottom-0 left-0 right-0 z-50 border-t-2 border-strike-red shadow-[0_-10px_40px_rgba(255,42,109,0.15)] outline-none max-h-[90vh]">
          <div className="mx-auto w-16 h-1.5 flex-shrink-0 rounded-full bg-navy-800 mt-4 mb-2" />
          
          <div className="p-6 pb-10 max-w-md mx-auto w-full">
            <h2 className="font-heading text-2xl text-white mb-6 flex items-center gap-2">
                <Swords className="w-6 h-6 text-strike-red" /> REPORT RESULT
            </h2>

            <div className="space-y-6">
                {/* Opponent */}
                <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Opponent Deck</label>
                    <Input 
                        value={opponentDeck} 
                        onChange={(e) => setOpponentDeck(e.target.value)} 
                        placeholder="e.g. Snake-Eyes" 
                        autoFocus
                        className="h-12 text-lg"
                    />
                </div>

                {/* Dice Roll */}
                <div>
                    <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Dice Roll</label>
                    <div className="grid grid-cols-2 gap-2 bg-navy-950 p-1 rounded-lg border border-navy-800">
                        <button
                            onClick={() => setGoingFirst(true)}
                            className={`py-2 rounded text-sm font-bold transition-all ${goingFirst ? 'bg-cyan-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            GOING FIRST
                        </button>
                        <button
                            onClick={() => setGoingFirst(false)}
                            className={`py-2 rounded text-sm font-bold transition-all ${!goingFirst ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            GOING SECOND
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleLog('win')}
                        disabled={isSubmitting}
                        className="bg-green-500/10 border border-green-500/50 hover:bg-green-500 hover:text-black text-green-500 rounded-xl h-24 flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Trophy className="w-8 h-8" />
                        <span className="font-heading text-xl tracking-widest">VICTORY</span>
                    </button>
                    <button
                        onClick={() => handleLog('loss')}
                        disabled={isSubmitting}
                        className="bg-red-500/10 border border-red-500/50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl h-24 flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Skull className="w-8 h-8" />
                        <span className="font-heading text-xl tracking-widest">DEFEAT</span>
                    </button>
                </div>
                <button
                    onClick={() => handleLog('draw')}
                    disabled={isSubmitting}
                    className="w-full py-3 border border-navy-700 rounded-lg text-gray-500 hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
                >
                    <Minus className="w-4 h-4" /> DRAW
                </button>

                {/* Notes */}
                <div>
                    <button 
                        onClick={() => setShowNotes(!showNotes)}
                        className="flex items-center gap-2 text-xs font-mono text-cyan-500 hover:text-cyan-400"
                    >
                        {showNotes ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        ADD BATTLE NOTES
                    </button>
                    {showNotes && (
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Key moments, mistakes, side deck choices..."
                            className="w-full mt-2 bg-navy-950 border border-navy-800 rounded p-3 text-sm text-gray-300 focus:border-cyan-500 outline-none h-24 resize-none"
                        />
                    )}
                </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
