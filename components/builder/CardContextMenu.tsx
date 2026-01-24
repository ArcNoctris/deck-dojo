'use client';

import React from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { useBuilderStore } from '@/store/builder-store';
import { UserTag } from '@/types/deck';
import { ChevronRight, Trash2, ArrowLeftRight } from 'lucide-react';

interface CardContextMenuProps {
  children: React.ReactNode;
  instanceId: string;
  location: 'main' | 'extra' | 'side';
  cardType: string | null;
}

export const CardContextMenu = ({ children, instanceId, location, cardType }: CardContextMenuProps) => {
  const { moveCard, setCardTag, removeCard } = useBuilderStore();

  const handleMove = (target: 'main' | 'extra' | 'side') => {
      moveCard(instanceId, location, target);
  };

  const handleTag = (tag: UserTag) => {
      setCardTag(instanceId, location, tag);
  };

  // Determine valid move targets
  let validTargets: ('main' | 'extra' | 'side')[] = [];
  if (location === 'main') validTargets = ['side'];
  if (location === 'extra') validTargets = ['side'];
  if (location === 'side') {
      // Check type to see if it belongs in Main or Extra
      if (cardType && (cardType.includes('Fusion') || cardType.includes('Synchro') || cardType.includes('XYZ') || cardType.includes('Link'))) {
          validTargets = ['extra'];
      } else {
          validTargets = ['main'];
      }
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        {children}
      </ContextMenu.Trigger>
      
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-[180px] bg-navy-900/95 border border-cyan-500/50 rounded-lg p-1 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md animate-in fade-in zoom-in duration-100 z-50 text-xs font-mono">
            
            {/* Move Options */}
            {validTargets.map(target => (
                <ContextMenu.Item 
                    key={target} 
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer outline-none text-gray-300"
                    onSelect={() => handleMove(target)}
                >
                    <ArrowLeftRight className="w-3 h-3" />
                    Move to {target.toUpperCase()}
                </ContextMenu.Item>
            ))}

            <ContextMenu.Separator className="h-[1px] bg-navy-700 my-1" />

            {/* Tag Submenu */}
            <ContextMenu.Sub>
                <ContextMenu.SubTrigger className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer outline-none text-gray-300">
                    <span>Set Tag</span>
                    <ChevronRight className="w-3 h-3" />
                </ContextMenu.SubTrigger>
                <ContextMenu.Portal>
                    <ContextMenu.SubContent className="min-w-[140px] bg-navy-900/95 border border-navy-700 rounded-lg p-1 shadow-xl ml-1 animate-in fade-in zoom-in duration-100 text-xs font-mono z-50">
                        <TagItem label="Starter" color="text-green-400" onSelect={() => handleTag('starter')} />
                        <TagItem label="Extender" color="text-yellow-400" onSelect={() => handleTag('extender')} />
                        <TagItem label="Brick" color="text-red-400" onSelect={() => handleTag('brick')} />
                        <TagItem label="Engine" color="text-purple-400" onSelect={() => handleTag('engine')} />
                        <TagItem label="Flex" color="text-blue-400" onSelect={() => handleTag('flex')} />
                        <TagItem label="Hand Trap" color="text-orange-400" onSelect={() => handleTag('hand-trap')} />
                        <TagItem label="Defense" color="text-gray-400" onSelect={() => handleTag('defense')} />
                        <ContextMenu.Separator className="h-[1px] bg-navy-700 my-1" />
                        <TagItem label="Clear Tag" color="text-white" onSelect={() => handleTag(null)} />
                    </ContextMenu.SubContent>
                </ContextMenu.Portal>
            </ContextMenu.Sub>

            <ContextMenu.Separator className="h-[1px] bg-navy-700 my-1" />

            {/* Remove */}
            <ContextMenu.Item 
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-500/10 hover:text-red-400 cursor-pointer outline-none text-gray-300"
                onSelect={() => removeCard(instanceId, location)}
            >
                <Trash2 className="w-3 h-3" />
                Remove
            </ContextMenu.Item>

        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};

const TagItem = ({ label, color, onSelect }: any) => (
    <ContextMenu.Item 
        className={`px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer outline-none ${color}`}
        onSelect={onSelect}
    >
        {label}
    </ContextMenu.Item>
);
