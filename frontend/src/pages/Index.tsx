import { useState, useEffect, useRef } from 'react';
import { Pokemon } from '@/types/pokemon';
import { Header } from '@/components/Header';
import { FiltersSidebar } from '@/components/Filters/FiltersSidebar';
import { PokemonGrid } from '@/components/PokemonGrid';
import { PokemonModal } from '@/components/PokemonModal';
import { ComparisonPanel } from '@/components/ComparisonPanel';
import { useBackendPokemon } from '@/hooks/useBackendPokemon';
import { usePokemonFilters } from '@/hooks/usePokemonSearch';
import { useCompare } from '@/hooks/useCompare';
import { useViewSettings } from '@/hooks/useViewSettings';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const scrollContainerRef = useRef<HTMLElement>(null);
  
  const { filters, updateTypes, updateGenerations, updateStatRange, resetFilters } = usePokemonFilters();

  const {
    compareList,
    isCompareMode,
    toggleCompare,
    removeFromCompare,
    clearCompare,
    toggleCompareMode,
  } = useCompare();

  const {
    viewMode,
    cardSize,
    sortField,
    sortDirection,
    setViewMode,
    setCardSize,
    setSortField,
    toggleSortDirection,
  } = useViewSettings();

  const { 
    pokemons: pokemon, 
    loading: isLoading, 
    error,
    totalCount: total, 
    totalPages,
    currentPage,
    search
  } = useBackendPokemon();
  
  // State for infinite scrolling
  const [loadedCount, setLoadedCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsFetchingNextPage(true);
      try {
        await search({
          search: searchQuery,
          type: filters.types.length > 0 ? filters.types.join(',') : undefined,
          generation: filters.generations.length > 0 ? filters.generations.join(',') : undefined,
          minHp: filters.minHp,
          minAttack: filters.minAttack,
          minDefense: filters.minDefense,
          minSpeed: filters.minSpeed,
          sortBy: sortField === 'id' ? 'pokemonId' : sortField,
          sortOrder: sortDirection.toUpperCase() as 'ASC' | 'DESC',
          page: 1,
          limit: 20
        });
      } finally {
        setIsFetchingNextPage(false);
      }
    };
    
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filters, sortField, sortDirection]);

  // Keyboard shortcuts
  const gridColumns = cardSize === 'compact' ? 6 : cardSize === 'large' ? 4 : 5;
  useKeyboardShortcuts({
    pokemon,
    selectedIndex,
    setSelectedIndex,
    onPokemonClick: setSelectedPokemon,
    isCompareMode,
    onToggleCompare: toggleCompare,
    onToggleCompareMode: toggleCompareMode,
    gridColumns,
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        resultCount={pokemon.length}
        totalCount={total}
        sortField={sortField}
        sortDirection={sortDirection}
        viewMode={viewMode}
        cardSize={cardSize}
        onSortFieldChange={setSortField}
        onSortDirectionToggle={toggleSortDirection}
        onViewModeChange={setViewMode}
        onCardSizeChange={setCardSize}
        filters={filters}
        onTypesChange={updateTypes}
        onStatChange={updateStatRange}
        onGenerationsChange={updateGenerations}
        onResetFilters={resetFilters}
        isCompareMode={isCompareMode}
        onToggleCompareMode={toggleCompareMode}
        compareCount={compareList.length}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <FiltersSidebar
          filters={filters}
          onTypesChange={updateTypes}
          onStatChange={updateStatRange}
          onGenerationsChange={updateGenerations}
          onReset={resetFilters}
          isCompareMode={isCompareMode}
          onToggleCompareMode={toggleCompareMode}
          compareCount={compareList.length}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-thin">
          <PokemonGrid
            pokemon={pokemon}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={currentPage < totalPages}
            loadedCount={pokemon.length}
            total={total}
            onPokemonClick={setSelectedPokemon}
            onLoadMore={async () => {
              if (currentPage < totalPages) {
                // Save scroll position before loading more
                const scrollTop = scrollContainerRef.current?.scrollTop || 0;
                
                setIsFetchingNextPage(true);
                try {
                  await search({
                    search: searchQuery,
                    type: filters.types.length > 0 ? filters.types.join(',') : undefined,
                    generation: filters.generations.length > 0 ? filters.generations.join(',') : undefined,
                    minHp: filters.minHp,
                    minAttack: filters.minAttack,
                    minDefense: filters.minDefense,
                    minSpeed: filters.minSpeed,
                    sortBy: sortField === 'id' ? 'pokemonId' : sortField,
                    sortOrder: sortDirection.toUpperCase() as 'ASC' | 'DESC',
                    page: currentPage + 1,
                    limit: 20
                  });
                  
                  // Restore scroll position after new items are added
                  requestAnimationFrame(() => {
                    if (scrollContainerRef.current) {
                      scrollContainerRef.current.scrollTop = scrollTop;
                    }
                  });
                } finally {
                  setIsFetchingNextPage(false);
                }
              }
            }}
            compareList={compareList}
            isCompareMode={isCompareMode}
            onToggleCompare={toggleCompare}
            viewMode={viewMode}
            cardSize={cardSize}
            selectedIndex={selectedIndex}
          />
        </main>
      </div>

      <PokemonModal
        pokemon={selectedPokemon}
        onClose={() => setSelectedPokemon(null)}
      />

      {isCompareMode && (
        <ComparisonPanel
          pokemon={compareList}
          onRemove={removeFromCompare}
          onClear={clearCompare}
        />
      )}

      <KeyboardShortcutsHelp />
    </div>
  );
};

export default Index;
