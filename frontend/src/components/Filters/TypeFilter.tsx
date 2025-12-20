import { POKEMON_TYPES } from '@/types/pokemon';
import { cn } from '@/lib/utils';

interface TypeFilterProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
}

export function TypeFilter({ selectedTypes, onTypesChange }: TypeFilterProps) {
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Types</h3>
      <div className="flex flex-wrap gap-2">
        {POKEMON_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={cn(
              `type-${type}`,
              "px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-all duration-200",
              selectedTypes.includes(type) 
                ? "ring-2 ring-foreground/50 scale-105" 
                : "opacity-60 hover:opacity-100"
            )}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
