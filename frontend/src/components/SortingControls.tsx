import { ArrowUp, ArrowDown, Grid3X3, List, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { SortField, SortDirection, ViewMode, CardSize } from '@/hooks/useViewSettings';

interface SortingControlsProps {
  sortField: SortField;
  sortDirection: SortDirection;
  viewMode: ViewMode;
  cardSize: CardSize;
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionToggle: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onCardSizeChange: (size: CardSize) => void;
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'id', label: 'ID' },
  { value: 'name', label: 'Name' },
  { value: 'hp', label: 'HP' },
  { value: 'attack', label: 'Atk' },
  { value: 'defense', label: 'Def' },
  { value: 'speed', label: 'Spd' },
  { value: 'total', label: 'Total' },
];

export function SortingControls({
  sortField,
  sortDirection,
  viewMode,
  cardSize,
  onSortFieldChange,
  onSortDirectionToggle,
  onViewModeChange,
  onCardSizeChange,
}: SortingControlsProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
      {/* Sort */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <Select value={sortField} onValueChange={(v) => onSortFieldChange(v as SortField)}>
          <SelectTrigger className="h-7 sm:h-8 w-[70px] sm:w-[100px] text-xs bg-secondary border-transparent">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8"
          onClick={onSortDirectionToggle}
        >
          {sortDirection === 'asc' ? (
            <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          )}
        </Button>
      </div>

      <div className="h-4 w-px bg-border hidden sm:block" />

      {/* View Mode */}
      <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && onViewModeChange(v as ViewMode)}>
        <ToggleGroupItem value="grid" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
          <Grid3X3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
          <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="h-4 w-px bg-border hidden sm:block" />

      {/* Card Size - hide on very small screens */}
      <ToggleGroup 
        type="single" 
        value={cardSize} 
        onValueChange={(v) => v && onCardSizeChange(v as CardSize)}
        className="hidden xs:flex"
      >
        <ToggleGroupItem value="compact" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
          <Minimize2 className="h-3 w-3" />
        </ToggleGroupItem>
        <ToggleGroupItem value="normal" size="sm" className="h-7 px-1.5 sm:px-2 text-xs">
          M
        </ToggleGroupItem>
        <ToggleGroupItem value="large" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
          <Maximize2 className="h-3 w-3" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
