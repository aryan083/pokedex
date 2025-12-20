import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PokemonFilters } from '@/types/pokemon';
import { CompactFilters } from './CompactFilters';

interface FiltersSidebarProps {
  filters: PokemonFilters;
  onTypesChange: (types: string[]) => void;
  onStatChange: (stat: 'hp' | 'attack' | 'defense' | 'speed', min: number, max: number) => void;
  onGenerationsChange: (generations: number[]) => void;
  onReset: () => void;
  isCompareMode: boolean;
  onToggleCompareMode: () => void;
  compareCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function FiltersSidebar({ 
  filters, 
  onTypesChange, 
  onStatChange, 
  onGenerationsChange,
  onReset,
  isCompareMode,
  onToggleCompareMode,
  compareCount,
  isCollapsed,
  onToggleCollapse,
}: FiltersSidebarProps) {
  // Collapsed state - just show expand button
  if (isCollapsed) {
    return (
      <aside className="hidden lg:flex w-12 shrink-0 border-r border-border bg-card/50 flex-col items-center py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
          title="Expand filters"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:flex w-72 shrink-0 border-r border-border bg-card/50 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-7 w-7"
            title="Collapse filters"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
          <h2 className="text-sm font-semibold">Filters</h2>
        </div>
      </div>

      {/* Filter Content */}
      <div className="p-4 flex-1 overflow-y-auto scrollbar-thin">
        <CompactFilters
          filters={filters}
          onTypesChange={onTypesChange}
          onStatChange={onStatChange}
          onGenerationsChange={onGenerationsChange}
          onReset={onReset}
          isCompareMode={isCompareMode}
          onToggleCompareMode={onToggleCompareMode}
          compareCount={compareCount}
        />

        {/* Search Tips */}
        <div className="mt-6 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Search Tips</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p><code className="bg-secondary px-1.5 py-0.5 rounded font-mono">fast</code> speed &gt; 100</p>
            <p><code className="bg-secondary px-1.5 py-0.5 rounded font-mono">tank</code> high HP + defense</p>
            <p><code className="bg-secondary px-1.5 py-0.5 rounded font-mono">glass</code> high atk, low def</p>
            <p><code className="bg-secondary px-1.5 py-0.5 rounded font-mono">fire</code> filter by type</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
