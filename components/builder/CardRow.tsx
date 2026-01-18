import React from 'react';
import { Card } from '@/types/database.types';
import { useBuilderStore } from '@/store/builder-store';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

interface CardRowProps {
  card: Card;
  style?: React.CSSProperties; // For virtualizer positioning
}

export const CardRow = ({ card, style }: CardRowProps) => {
  const addCard = useBuilderStore((state) => state.addCard);

  const handleAdd = () => {
    let location: 'main' | 'extra' | 'side' = 'main';
    const type = card.type?.toLowerCase() || '';
    if (type.includes('fusion') || type.includes('synchro') || type.includes('xyz') || type.includes('link') || type.includes('token')) {
      location = 'extra';
    }
    // Note: Tokens technically go to side/token pile but usually treated as extra for simplicity or ignored. 
    // Logic can be refined.
    
    addCard(card, location);
  };

  return (
    <div style={style} className="flex items-center gap-3 px-3 border-b border-navy-800 hover:bg-navy-800/30 transition-colors box-border w-full">
      {/* Thumbnail */}
      <div className="w-[42px] h-[61px] relative bg-navy-900 overflow-hidden rounded-sm flex-shrink-0 border border-navy-800">
          {card.image_url_small ? (
              <img src={card.image_url_small} alt={card.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
              <div className="w-full h-full bg-navy-800 flex items-center justify-center text-[8px] text-gray-600">NO IMG</div>
          )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center h-full py-2">
        <h4 className="font-heading text-cyan-50 text-sm font-semibold truncate leading-tight">{card.name}</h4>
        <div className="flex items-center gap-2 mt-0.5">
             <span className="font-mono text-gray-500 text-[10px] uppercase truncate">{card.type}</span>
             {card.level && <span className="font-mono text-focus-amber text-[10px]">LV{card.level}</span>}
        </div>
      </div>

      {/* Action */}
      <Button 
        variant="primary" 
        className="!p-0 !px-0 w-[44px] h-[44px] flex items-center justify-center shrink-0" 
        onClick={handleAdd}
        aria-label={`Add ${card.name}`}
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};
