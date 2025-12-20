import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Pokemon } from '@/types/pokemon';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface PokemonModalProps {
  pokemon: Pokemon | null;
  onClose: () => void;
}

function StatBar({ label, value, max = 255, color }: { label: string; value: number; max?: number; color: string }) {
  const percentage = (value / max) * 100;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground capitalize">{label}</span>
        <span className="font-mono font-medium">{value}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function PokemonModal({ pokemon, onClose }: PokemonModalProps) {
  if (!pokemon) return null;

  const statColors = {
    hp: 'bg-pokemon-grass',
    attack: 'bg-pokemon-fire',
    defense: 'bg-pokemon-water',
    specialAttack: 'bg-pokemon-psychic',
    specialDefense: 'bg-pokemon-ghost',
    speed: 'bg-pokemon-electric',
  };

  const primaryType = pokemon.types[0];

  return (
    <Dialog open={!!pokemon} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-3xl bg-card border-border p-0 overflow-hidden [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>{pokemon.name}</DialogTitle>
        </VisuallyHidden>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 bg-background/80 hover:bg-background transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col sm:flex-row">
          {/* Left side - Image */}
          <div className={cn(
            "relative sm:w-2/5 flex items-center justify-center p-8",
            `bg-gradient-to-br from-pokemon-${primaryType}/20 to-pokemon-${primaryType}/5`
          )}>
            <div className="absolute top-4 left-4 px-3 py-1 bg-background/60 backdrop-blur-sm rounded-full text-sm font-mono text-muted-foreground">
              #{pokemon.id.toString().padStart(3, '0')}
            </div>
            <img
              src={pokemon.artwork || pokemon.sprite}
              alt={pokemon.name}
              className="w-48 h-48 object-contain drop-shadow-2xl"
            />
          </div>

          {/* Right side - Content */}
          <div className="sm:w-3/5 p-6 space-y-5">
            <div>
              <h2 className="text-2xl font-bold capitalize mb-2">{pokemon.name}</h2>
              <div className="flex gap-2">
                {pokemon.types.map((type) => (
                  <span
                    key={type}
                    className={cn(
                      `type-${type}`,
                      "px-3 py-1 text-sm font-medium rounded-full capitalize"
                    )}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 py-3 border-y border-border">
              <div>
                <p className="text-xl font-bold">{pokemon.height}m</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Height</p>
              </div>
              <div>
                <p className="text-xl font-bold">{pokemon.weight}kg</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Weight</p>
              </div>
              <div>
                <p className="text-sm font-medium capitalize truncate">{pokemon.abilities[0]?.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Ability</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Base Stats</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <StatBar label="HP" value={pokemon.stats.hp} color={statColors.hp} />
                <StatBar label="Attack" value={pokemon.stats.attack} color={statColors.attack} />
                <StatBar label="Defense" value={pokemon.stats.defense} color={statColors.defense} />
                <StatBar label="Sp. Atk" value={pokemon.stats.specialAttack} color={statColors.specialAttack} />
                <StatBar label="Sp. Def" value={pokemon.stats.specialDefense} color={statColors.specialDefense} />
                <StatBar label="Speed" value={pokemon.stats.speed} color={statColors.speed} />
              </div>
            </div>

            {pokemon.abilities.length > 1 && (
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">All Abilities</h3>
                <div className="flex flex-wrap gap-2">
                  {pokemon.abilities.map((ability) => (
                    <span
                      key={ability}
                      className="px-3 py-1 bg-secondary text-sm rounded-full capitalize"
                    >
                      {ability.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
