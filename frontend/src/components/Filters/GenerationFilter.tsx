import { cn } from '@/lib/utils';

interface GenerationFilterProps {
  selectedGenerations: number[];
  onGenerationsChange: (generations: number[]) => void;
}

const GENERATIONS = [
  { id: 1, name: 'Gen I', range: [1, 151], region: 'Kanto' },
  { id: 2, name: 'Gen II', range: [152, 251], region: 'Johto' },
  { id: 3, name: 'Gen III', range: [252, 386], region: 'Hoenn' },
  { id: 4, name: 'Gen IV', range: [387, 493], region: 'Sinnoh' },
  { id: 5, name: 'Gen V', range: [494, 649], region: 'Unova' },
  { id: 6, name: 'Gen VI', range: [650, 721], region: 'Kalos' },
  { id: 7, name: 'Gen VII', range: [722, 809], region: 'Alola' },
  { id: 8, name: 'Gen VIII', range: [810, 905], region: 'Galar' },
  { id: 9, name: 'Gen IX', range: [906, 1025], region: 'Paldea' },
];

export function GenerationFilter({ selectedGenerations, onGenerationsChange }: GenerationFilterProps) {
  const toggleGeneration = (genId: number) => {
    if (selectedGenerations.includes(genId)) {
      onGenerationsChange(selectedGenerations.filter(id => id !== genId));
    } else {
      onGenerationsChange([...selectedGenerations, genId]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Generation</h3>
      <div className="grid grid-cols-3 gap-1.5">
        {GENERATIONS.map((gen) => (
          <button
            key={gen.id}
            onClick={() => toggleGeneration(gen.id)}
            className={cn(
              "px-2 py-1.5 text-xs rounded-lg transition-all duration-200 border",
              selectedGenerations.includes(gen.id)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground"
            )}
          >
            {gen.name}
          </button>
        ))}
      </div>
      {selectedGenerations.length > 0 && (
        <button
          onClick={() => onGenerationsChange([])}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear generations
        </button>
      )}
    </div>
  );
}

export { GENERATIONS };
