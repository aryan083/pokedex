import { X, BarChart3 } from 'lucide-react';
import { Pokemon } from '@/types/pokemon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ComparisonPanelProps {
  pokemon: Pokemon[];
  onRemove: (id: number) => void;
  onClear: () => void;
}

const STAT_LABELS = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  specialAttack: 'Sp. Atk',
  specialDefense: 'Sp. Def',
  speed: 'Speed',
};

const STAT_COLORS = {
  hp: 'bg-pokemon-grass',
  attack: 'bg-pokemon-fire',
  defense: 'bg-pokemon-water',
  specialAttack: 'bg-pokemon-psychic',
  specialDefense: 'bg-pokemon-ghost',
  speed: 'bg-pokemon-electric',
};

export function ComparisonPanel({ pokemon, onRemove, onClear }: ComparisonPanelProps) {
  if (pokemon.length === 0) return null;

  const maxStats = {
    hp: Math.max(...pokemon.map(p => p.stats.hp)),
    attack: Math.max(...pokemon.map(p => p.stats.attack)),
    defense: Math.max(...pokemon.map(p => p.stats.defense)),
    specialAttack: Math.max(...pokemon.map(p => p.stats.specialAttack)),
    specialDefense: Math.max(...pokemon.map(p => p.stats.specialDefense)),
    speed: Math.max(...pokemon.map(p => p.stats.speed)),
  };

  const getTotalStats = (p: Pokemon) => 
    Object.values(p.stats).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-2xl z-40 animate-slide-in-bottom">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Compare Pokémon</h3>
            <span className="text-sm text-muted-foreground">({pokemon.length}/3)</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pokemon.map((p) => (
            <div key={p.id} className="relative bg-secondary/50 rounded-xl p-4">
              <button
                onClick={() => onRemove(p.id)}
                className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-destructive/20 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <img
                  src={p.artwork || p.sprite}
                  alt={p.name}
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h4 className="font-medium capitalize">{p.name}</h4>
                  <div className="flex gap-1">
                    {p.types.map(type => (
                      <span key={type} className={cn(`type-${type}`, "px-1.5 py-0.5 text-[9px] rounded-full capitalize")}>
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {(Object.keys(STAT_LABELS) as Array<keyof typeof STAT_LABELS>).map((stat) => {
                  const value = p.stats[stat];
                  const isMax = value === maxStats[stat] && pokemon.length > 1;
                  const percentage = (value / 255) * 100;

                  return (
                    <div key={stat} className="space-y-0.5">
                      <div className="flex justify-between text-xs">
                        <span className={cn("text-muted-foreground", isMax && "text-primary font-medium")}>
                          {STAT_LABELS[stat]}
                        </span>
                        <span className={cn("font-mono", isMax && "text-primary font-bold")}>
                          {value}
                          {isMax && " ★"}
                        </span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(STAT_COLORS[stat], "h-full rounded-full transition-all")}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t border-border flex justify-between">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className={cn(
                  "text-sm font-bold font-mono",
                  getTotalStats(p) === Math.max(...pokemon.map(getTotalStats)) && pokemon.length > 1 && "text-primary"
                )}>
                  {getTotalStats(p)}
                </span>
              </div>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: 3 - pokemon.length }).map((_, i) => (
            <div key={`empty-${i}`} className="border-2 border-dashed border-border rounded-xl p-4 flex items-center justify-center min-h-[200px]">
              <p className="text-sm text-muted-foreground">Select a Pokémon to compare</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
