import { useEffect, useRef } from 'react';
import { Pokemon } from '@/types/pokemon';
import { PokemonCard, PokemonCardSkeleton } from './PokemonCard';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { CardSize, ViewMode } from '@/hooks/useViewSettings';
import { cn } from '@/lib/utils';

interface PokemonGridProps {
  pokemon: Pokemon[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  loadedCount: number;
  total: number;
  onPokemonClick: (pokemon: Pokemon) => void;
  onLoadMore: () => void;
  compareList?: Pokemon[];
  isCompareMode?: boolean;
  onToggleCompare?: (pokemon: Pokemon) => void;
  viewMode?: ViewMode;
  cardSize?: CardSize;
  selectedIndex?: number;
}

export function PokemonGrid({ 
  pokemon, 
  isLoading, 
  isFetchingNextPage,
  hasNextPage,
  loadedCount,
  total,
  onPokemonClick,
  onLoadMore,
  compareList = [],
  isCompareMode = false,
  onToggleCompare,
  viewMode = 'grid',
  cardSize = 'normal',
  selectedIndex = -1,
}: PokemonGridProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, isLoading, onLoadMore]);

  useEffect(() => {
    if (selectedRef.current && selectedIndex >= 0) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedIndex]);

  // Responsive grid classes
  const gridClasses = {
    grid: {
      compact: 'grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-1.5 sm:gap-2',
      normal: 'grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4',
      large: 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5',
    },
    list: 'flex flex-col gap-2',
  };

  if (isLoading) {
    return (
      <div className={cn(
        "p-3 sm:p-6",
        viewMode === 'grid' ? `grid ${gridClasses.grid[cardSize]}` : gridClasses.list
      )}>
        {Array.from({ length: 18 }).map((_, i) => (
          <PokemonCardSkeleton key={i} cardSize={cardSize} />
        ))}
      </div>
    );
  }

  if (pokemon.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center px-4">
        <div className="text-5xl sm:text-6xl mb-4">🔍</div>
        <h3 className="text-base sm:text-lg font-medium mb-2">No Pokémon found</h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
          Try adjusting your search or filters. Use terms like "fast", "tank", or "glass".
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <div className={cn(
        viewMode === 'grid' ? `grid ${gridClasses.grid[cardSize]}` : gridClasses.list
      )}>
        {pokemon.map((p, index) => (
          <div
            key={p.id}
            ref={index === selectedIndex ? selectedRef : undefined}
            className="animate-fade-in"
            style={{ animationDelay: `${Math.min(index * 20, 200)}ms` }}
          >
            <PokemonCard 
              pokemon={p} 
              onClick={onPokemonClick}
              isComparing={compareList.some(cp => cp.id === p.id)}
              onToggleCompare={onToggleCompare}
              isCompareMode={isCompareMode}
              cardSize={cardSize}
              viewMode={viewMode}
              isSelected={index === selectedIndex}
            />
          </div>
        ))}
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="mt-6 sm:mt-8 flex flex-col items-center gap-4">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            <span>Loading more...</span>
          </div>
        )}
        
        {hasNextPage && !isFetchingNextPage && (
          <Button variant="outline" size="sm" onClick={onLoadMore}>
            Load More ({loadedCount} / {total})
          </Button>
        )}

        {!hasNextPage && loadedCount > 0 && (
          <p className="text-xs sm:text-sm text-muted-foreground">
            All {loadedCount} Pokémon loaded!
          </p>
        )}
      </div>
    </div>
  );
}
