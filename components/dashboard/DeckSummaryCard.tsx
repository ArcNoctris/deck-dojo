import Link from 'next/link';
import { Deck } from '@/types/database.types';
import { Scroll, Clock } from 'lucide-react';
import { CyberCard } from '@/components/ui/CyberCard';

interface DeckSummaryCardProps {
  deck: Deck;
}

export const DeckSummaryCard = ({ deck }: DeckSummaryCardProps) => {
  return (
    <Link href={`/deck/${deck.id}`}>
      <CyberCard className="h-full group cursor-pointer hover:border-cyan-500/80 hover:shadow-[0_0_20px_rgba(8,217,214,0.2)] transition-all duration-300">
        <div className="flex flex-col h-full justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <Scroll className="w-5 h-5 text-cyan-500 group-hover:text-cyan-400" />
                <span className="font-mono text-xs text-cyan-500 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded-full">{deck.format || 'Advanced'}</span>
            </div>
            <h3 className="font-heading text-xl text-white font-bold tracking-wide group-hover:text-cyan-400 transition-colors truncate">
                {deck.name}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 text-gray-500 text-xs font-mono border-t border-navy-800 pt-3 mt-auto">
            <Clock className="w-3 h-3" />
            <span>Updated: {new Date(deck.created_at || new Date()).toLocaleDateString()}</span>
          </div>
        </div>
      </CyberCard>
    </Link>
  );
};
