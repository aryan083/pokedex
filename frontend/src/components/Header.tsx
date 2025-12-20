import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SortingControls } from './SortingControls';
import { MobileFilters } from './Filters/MobileFilters';
import { SortField, SortDirection, ViewMode, CardSize } from '@/hooks/useViewSettings';
import { PokemonFilters } from '@/types/pokemon';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultCount: number;
  totalCount: number;
  // Sorting & View
  sortField: SortField;
  sortDirection: SortDirection;
  viewMode: ViewMode;
  cardSize: CardSize;
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionToggle: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onCardSizeChange: (size: CardSize) => void;
  // Filters (for mobile)
  filters: PokemonFilters;
  onTypesChange: (types: string[]) => void;
  onStatChange: (stat: 'hp' | 'attack' | 'defense' | 'speed', min: number, max: number) => void;
  onGenerationsChange: (generations: number[]) => void;
  onResetFilters: () => void;
  // Compare
  isCompareMode: boolean;
  onToggleCompareMode: () => void;
  compareCount: number;
}

export function Header({ 
  searchQuery, 
  onSearchChange, 
  resultCount, 
  totalCount,
  sortField,
  sortDirection,
  viewMode,
  cardSize,
  onSortFieldChange,
  onSortDirectionToggle,
  onViewModeChange,
  onCardSizeChange,
  filters,
  onTypesChange,
  onStatChange,
  onGenerationsChange,
  onResetFilters,
  isCompareMode,
  onToggleCompareMode,
  compareCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-lg sm:text-xl">⚡</span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold tracking-tight">PokéDex</h1>
            <p className="text-xs text-muted-foreground">Data-First Search</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search pokémon..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-secondary border-transparent focus:border-primary/50 h-9 sm:h-10 text-sm"
          />
        </div>

        {/* Mobile: Filter button */}
        <div className="lg:hidden">
          <MobileFilters
            filters={filters}
            onTypesChange={onTypesChange}
            onStatChange={onStatChange}
            onGenerationsChange={onGenerationsChange}
            onReset={onResetFilters}
            isCompareMode={isCompareMode}
            onToggleCompareMode={onToggleCompareMode}
            compareCount={compareCount}
          />
        </div>

        {/* Desktop: Sorting controls */}
        <div className="hidden lg:flex items-center gap-4">
          <SortingControls
            sortField={sortField}
            sortDirection={sortDirection}
            viewMode={viewMode}
            cardSize={cardSize}
            onSortFieldChange={onSortFieldChange}
            onSortDirectionToggle={onSortDirectionToggle}
            onViewModeChange={onViewModeChange}
            onCardSizeChange={onCardSizeChange}
          />
        </div>

        {/* Count */}
        <div className="text-right shrink-0 hidden sm:block">
          <p className="text-sm font-medium font-mono">
            {resultCount.toLocaleString()}
            <span className="text-muted-foreground"> / {totalCount.toLocaleString()}</span>
          </p>
          <p className="text-xs text-muted-foreground">Pokémon</p>
        </div>
      </div>

      {/* Mobile sorting controls */}
      <div className="lg:hidden px-3 sm:px-6 pb-3 flex items-center justify-between gap-2">
        <SortingControls
          sortField={sortField}
          sortDirection={sortDirection}
          viewMode={viewMode}
          cardSize={cardSize}
          onSortFieldChange={onSortFieldChange}
          onSortDirectionToggle={onSortDirectionToggle}
          onViewModeChange={onViewModeChange}
          onCardSizeChange={onCardSizeChange}
        />
        <p className="text-xs font-mono text-muted-foreground sm:hidden">
          {resultCount}/{totalCount}
        </p>
      </div>
    </header>
  );
}
