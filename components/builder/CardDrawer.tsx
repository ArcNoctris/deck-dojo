'use client';

import React, { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { useDebounce } from 'use-debounce';
import { Input } from '@/components/ui/Input';
import { VirtualCardList } from './VirtualCardList';
import { FilterPanel } from './FilterPanel';
import { Button } from '@/components/ui/Button';
import { Database, Sparkles } from 'lucide-react';
import { useBuilderStore } from '@/store/builder-store';
import { OracleRecommendations } from './OracleRecommendations';

export const CardDrawer = () => {
  const [localSearch, setLocalSearch] = useState('');
  const [debouncedSearch] = useDebounce(localSearch, 500);
  const { setFilters } = useBuilderStore();
  const [activeTab, setActiveTab] = useState<'search' | 'oracle'>('search');

  // Sync debounced search to store
  useEffect(() => {
    setFilters({ text: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  return (
    <Drawer.Root shouldScaleBackground>
      <Drawer.Trigger asChild>
        <Button 
            variant="primary" 
            className="fixed bottom-6 right-6 z-40 rounded-full w-14 h-14 !p-0 shadow-[0_0_20px_rgba(8,217,214,0.4)] flex items-center justify-center animate-bounce-subtle"
            aria-label="Open Card Drawer"
        >
             <Database className="w-6 h-6" />
        </Button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-navy-900 flex flex-col rounded-t-[20px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t-2 border-cyan-500 shadow-[0_-10px_40px_rgba(8,217,214,0.15)] outline-none">
          {/* Handle */}
          <div className="mx-auto w-16 h-1.5 flex-shrink-0 rounded-full bg-navy-800 mt-4 mb-2" />
          
          <div className="px-5 pb-0">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveTab('search')}
                    className={`font-heading text-xl tracking-widest uppercase flex items-center gap-2 transition-colors ${activeTab === 'search' ? 'text-cyan-500 glow-text-sm' : 'text-gray-500 hover:text-cyan-400'}`}
                  >
                      <Database className="w-5 h-5" /> ARMORY_DB
                  </button>
                  <button 
                    onClick={() => setActiveTab('oracle')}
                    className={`font-heading text-xl tracking-widest uppercase flex items-center gap-2 transition-colors ${activeTab === 'oracle' ? 'text-focus-amber drop-shadow-[0_0_8px_rgba(249,237,105,0.6)]' : 'text-gray-500 hover:text-focus-amber'}`}
                  >
                      <Sparkles className="w-5 h-5" /> THE ORACLE
                  </button>
                </div>
                <span className="text-[10px] font-mono text-gray-500">V.2.0.4</span>
            </div>
            
            {activeTab === 'search' && (
              <Input 
                  placeholder="SEARCH_QUERY..." 
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  autoFocus
                  className="w-full text-lg h-12 mb-4"
                  containerClassName="shadow-lg"
              />
            )}
          </div>

          {activeTab === 'search' && <FilterPanel />}

          <div className="flex-1 bg-navy-900 border-t border-navy-800 min-h-0 relative">
             <div className="absolute inset-0 bg-[linear-gradient(rgba(8,217,214,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(8,217,214,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
            {activeTab === 'search' ? <VirtualCardList /> : <OracleRecommendations />}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
