import { useState } from 'react';
import { RotateCcw, ChevronDown, GitCompare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { PokemonFilters, POKEMON_TYPES } from '@/types/pokemon';
import { cn } from '@/lib/utils';

const GENERATIONS = [
  { id: 1, name: 'I' },
  { id: 2, name: 'II' },
  { id: 3, name: 'III' },
  { id: 4, name: 'IV' },
  { id: 5, name: 'V' },
  { id: 6, name: 'VI' },
  { id: 7, name: 'VII' },
  { id: 8, name: 'VIII' },
  { id: 9, name: 'IX' },
];

interface CompactFiltersProps {
  filters: PokemonFilters;
  onTypesChange: (types: string[]) => void;
  onStatChange: (stat: 'hp' | 'attack' | 'defense' | 'speed', min: number, max: number) => void;
  onGenerationsChange: (generations: number[]) => void;
  onReset: () => void;
  isCompareMode: boolean;
  onToggleCompareMode: () => void;
  compareCount: number;
}

export function CompactFilters({
  filters,
  onTypesChange,
  onStatChange,
  onGenerationsChange,
  onReset,
  isCompareMode,
  onToggleCompareMode,
  compareCount,
}: CompactFiltersProps) {
  const [typesOpen, setTypesOpen] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const toggleType = (type: string) => {
    if (filters.types.includes(type)) {
      onTypesChange(filters.types.filter(t => t !== type));
    } else {
      onTypesChange([...filters.types, type]);
    }
  };

  const toggleGeneration = (genId: number) => {
    if (filters.generations.includes(genId)) {
      onGenerationsChange(filters.generations.filter(id => id !== genId));
    } else {
      onGenerationsChange([...filters.generations, genId]);
    }
  };

  const hasActiveFilters = 
    filters.types.length > 0 || 
    filters.generations.length > 0 ||
    filters.minHp > 0 || filters.maxHp < 100 ||
    filters.minAttack > 0 || filters.maxAttack < 100 ||
    filters.minDefense > 0 || filters.maxDefense < 100 ||
    filters.minSpeed > 0 || filters.maxSpeed < 100;

  return (
    <div className="space-y-3">
      {/* Compare Mode Toggle */}
      <button
        onClick={onToggleCompareMode}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 border",
          isCompareMode
            ? "bg-primary/10 border-primary/50 text-primary"
            : "bg-secondary/50 border-transparent hover:bg-secondary text-muted-foreground hover:text-foreground"
        )}
      >
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4" />
          <span className="text-sm">Compare</span>
        </div>
        {compareCount > 0 && (
          <Badge variant="secondary" className="text-xs h-5">
            {compareCount}/3
          </Badge>
        )}
      </button>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-2">
        {/* Types Dropdown */}
        <Popover open={typesOpen} onOpenChange={setTypesOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 gap-1 border-border/50 bg-secondary/50",
                filters.types.length > 0 && "border-primary/50 bg-primary/10"
              )}
            >
              Types
              {filters.types.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  {filters.types.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3 bg-card border-border" align="start">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Select Types</span>
              {filters.types.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => onTypesChange([])}
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POKEMON_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={cn(
                    `type-${type}`,
                    "px-2 py-0.5 text-xs font-medium rounded capitalize transition-all",
                    filters.types.includes(type)
                      ? "ring-2 ring-foreground/50 scale-105"
                      : "opacity-50 hover:opacity-80"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Generations Dropdown */}
        <Popover open={genOpen} onOpenChange={setGenOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 gap-1 border-border/50 bg-secondary/50",
                filters.generations.length > 0 && "border-primary/50 bg-primary/10"
              )}
            >
              Gen
              {filters.generations.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  {filters.generations.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3 bg-card border-border" align="start">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Generation</span>
              {filters.generations.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => onGenerationsChange([])}
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {GENERATIONS.map((gen) => (
                <button
                  key={gen.id}
                  onClick={() => toggleGeneration(gen.id)}
                  className={cn(
                    "w-8 h-8 text-xs rounded-md transition-all border",
                    filters.generations.includes(gen.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary"
                  )}
                >
                  {gen.name}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Stats Dropdown */}
        <Popover open={statsOpen} onOpenChange={setStatsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 gap-1 border-border/50 bg-secondary/50",
                (filters.minHp > 0 || filters.maxHp < 100 ||
                 filters.minAttack > 0 || filters.maxAttack < 100 ||
                 filters.minDefense > 0 || filters.maxDefense < 100 ||
                 filters.minSpeed > 0 || filters.maxSpeed < 100) && "border-primary/50 bg-primary/10"
              )}
            >
              Stats
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 bg-card border-border" align="start">
            <div className="space-y-2">
              <StatRangeInput
                label="HP"
                min={filters.minHp}
                max={filters.maxHp}
                onChange={(min, max) => onStatChange('hp', min, max)}
              />
              <StatRangeInput
                label="Attack"
                min={filters.minAttack}
                max={filters.maxAttack}
                onChange={(min, max) => onStatChange('attack', min, max)}
              />
              <StatRangeInput
                label="Defense"
                min={filters.minDefense}
                max={filters.maxDefense}
                onChange={(min, max) => onStatChange('defense', min, max)}
              />
              <StatRangeInput
                label="Speed"
                min={filters.minSpeed}
                max={filters.maxSpeed}
                onChange={(min, max) => onStatChange('speed', min, max)}
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={onReset}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {(filters.types.length > 0 || filters.generations.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {filters.types.map(type => (
            <Badge
              key={type}
              variant="secondary"
              className={cn(`type-${type}`, "text-xs cursor-pointer hover:opacity-80")}
              onClick={() => toggleType(type)}
            >
              {type}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.generations.map(gen => (
            <Badge
              key={gen}
              variant="secondary"
              className="text-xs cursor-pointer hover:opacity-80"
              onClick={() => toggleGeneration(gen)}
            >
              Gen {GENERATIONS.find(g => g.id === gen)?.name}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact stat range input component
function StatRangeInput({
  label,
  min,
  max,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-14">{label}</span>
      <Input
        type="number"
        min={0}
        max={255}
        value={min}
        onChange={(e) => onChange(Number(e.target.value), max)}
        className="h-7 w-16 text-xs px-2 bg-secondary border-border/50"
        placeholder="Min"
      />
      <span className="text-xs text-muted-foreground">—</span>
      <Input
        type="number"
        min={0}
        max={255}
        value={max}
        onChange={(e) => onChange(min, Number(e.target.value))}
        className="h-7 w-16 text-xs px-2 bg-secondary border-border/50"
        placeholder="Max"
      />
    </div>
  );
}
