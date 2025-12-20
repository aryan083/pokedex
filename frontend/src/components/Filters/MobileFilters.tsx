import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { PokemonFilters } from '@/types/pokemon';
import { CompactFilters } from './CompactFilters';

interface MobileFiltersProps {
  filters: PokemonFilters;
  onTypesChange: (types: string[]) => void;
  onStatChange: (stat: 'hp' | 'attack' | 'defense' | 'speed', min: number, max: number) => void;
  onGenerationsChange: (generations: number[]) => void;
  onReset: () => void;
  isCompareMode: boolean;
  onToggleCompareMode: () => void;
  compareCount: number;
}

export function MobileFilters({
  filters,
  onTypesChange,
  onStatChange,
  onGenerationsChange,
  onReset,
  isCompareMode,
  onToggleCompareMode,
  compareCount,
}: MobileFiltersProps) {
  const activeFilterCount = 
    filters.types.length + 
    filters.generations.length +
    (filters.minHp > 0 || filters.maxHp < 100 ? 1 : 0) +
    (filters.minAttack > 0 || filters.maxAttack < 100 ? 1 : 0) +
    (filters.minDefense > 0 || filters.maxDefense < 100 ? 1 : 0) +
    (filters.minSpeed > 0 || filters.maxSpeed < 100 ? 1 : 0);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-border/50 bg-secondary/50">
          <Filter className="h-4 w-4" />
          <span className="hidden xs:inline">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border pb-4">
          <DrawerTitle>Filters & Options</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto">
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
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Search Tips</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <p><code className="bg-secondary px-1.5 py-0.5 rounded font-mono">fast</code> speed &gt; 100</p>
              <p><code className="bg-secondary px-1.5 py-0.5 rounded font-mono">tank</code> HP + def</p>
              <p><code className="bg-secondary px-1.5 py-0.5 rounded font-mono">glass</code> atk, low def</p>
              <p><code className="bg-secondary px-1.5 py-0.5 rounded font-mono">fire</code> by type</p>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
