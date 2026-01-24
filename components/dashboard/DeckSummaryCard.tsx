import Link from 'next/link';
import { Deck } from '@/types/database.types';
import { Scroll, Clock } from 'lucide-react';
import { CyberCard } from '@/components/ui/CyberCard';

interface DeckWithCover extends Deck {
  cover_card?: {
    image_url: string | null;
    image_url_small: string | null;
  } | null;
}

interface DeckSummaryCardProps {
  deck: DeckWithCover | Deck;
}

export const DeckSummaryCard = ({ deck }: DeckSummaryCardProps) => {
  // Safe cast or check
  const coverUrl = (deck as DeckWithCover).cover_card?.image_url;

  return (
    <Link href={`/deck/${deck.id}`} className="block h-full">
      <CyberCard className="h-full group cursor-pointer hover:border-cyan-500/80 hover:shadow-[0_0_20px_rgba(8,217,214,0.2)] transition-all duration-300 overflow-hidden">
        
        {/* Dynamic Background */}
        {coverUrl && (
            <>
                <div 
                    className="absolute inset-0 z-0 opacity-25 group-hover:opacity-40 transition-opacity duration-500 ease-out"
                    style={{
                        backgroundImage: `url(${coverUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center 25%'
                    }}
                />
                {/* Gradient for text readability */}
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-navy-900/50 via-navy-900/80 to-navy-900" />
            </>
        )}

        <div className="relative z-10 flex flex-col h-full justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <Scroll className="w-5 h-5 text-cyan-500 group-hover:text-cyan-400 transition-colors" />
                <span className="font-mono text-xs text-cyan-500 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    {deck.format || 'Advanced'}
                </span>
            </div>
            <h3 className="font-heading text-xl text-white font-bold tracking-wide group-hover:text-cyan-400 transition-colors truncate drop-shadow-md">
                {deck.name}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 text-gray-400 text-xs font-mono border-t border-white/10 pt-3 mt-auto">
            <Clock className="w-3 h-3" />
            <span>Updated: {new Date(deck.created_at || new Date()).toLocaleDateString()}</span>
          </div>
        </div>
      </CyberCard>
    </Link>
  );
};
