import { GitCompare } from 'lucide-react';
import { Pokemon } from '@/types/pokemon';
import { cn } from '@/lib/utils';
import { CardSize, ViewMode } from '@/hooks/useViewSettings';

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick: (pokemon: Pokemon) => void;
  isComparing?: boolean;
  onToggleCompare?: (pokemon: Pokemon) => void;
  isCompareMode?: boolean;
  cardSize?: CardSize;
  viewMode?: ViewMode;
  isSelected?: boolean;
}

export function PokemonCard({ 
  pokemon, 
  onClick, 
  isComparing = false,
  onToggleCompare,
  isCompareMode = false,
  cardSize = 'normal',
  viewMode = 'grid',
  isSelected = false,
}: PokemonCardProps) {
  const primaryType = pokemon.types[0];

  const sizeClasses = {
    compact: {
      container: 'rounded-xl',
      image: 'h-20 w-16 h-16',
      imageWrapper: 'h-20',
      padding: 'p-2',
      text: 'text-xs',
      badge: 'text-[8px] px-1.5',
      stats: false,
    },
    normal: {
      container: 'rounded-2xl',
      image: 'w-20 h-20',
      imageWrapper: 'h-28',
      padding: 'p-3',
      text: 'text-sm',
      badge: 'text-[10px] px-2',
      stats: true,
    },
    large: {
      container: 'rounded-3xl',
      image: 'w-28 h-28',
      imageWrapper: 'h-36',
      padding: 'p-4',
      text: 'text-base',
      badge: 'text-xs px-2.5',
      stats: true,
    },
  };

  const size = sizeClasses[cardSize];

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onClick(pokemon)}
        className={cn(
          "group relative bg-card rounded-xl border border-border overflow-hidden cursor-pointer transition-all duration-300",
          "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
          "flex items-center gap-4 p-3",
          isComparing && "ring-2 ring-primary",
          isSelected && "ring-2 ring-primary/70 bg-primary/5"
        )}
      >
        <div className={cn(
          "shrink-0 w-16 h-16 rounded-lg flex items-center justify-center",
          `bg-gradient-to-br from-pokemon-${primaryType}/30 to-pokemon-${primaryType}/5`
        )}>
          <img
            src={pokemon.artwork || pokemon.sprite}
            alt={pokemon.name}
            className="w-12 h-12 object-contain"
            loading="lazy"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground">#{pokemon.id.toString().padStart(3, '0')}</span>
            <h3 className="font-semibold capitalize truncate">{pokemon.name}</h3>
          </div>
          <div className="flex gap-1">
            {pokemon.types.map((type) => (
              <span key={type} className={cn(`type-${type}`, "px-2 py-0.5 text-[10px] font-medium rounded-full capitalize")}>
                {type}
              </span>
            ))}
          </div>
        </div>

        <div className="hidden sm:grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">HP</p>
            <p className="font-mono font-medium">{pokemon.stats.hp}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ATK</p>
            <p className="font-mono font-medium">{pokemon.stats.attack}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">DEF</p>
            <p className="font-mono font-medium">{pokemon.stats.defense}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">SPD</p>
            <p className="font-mono font-medium">{pokemon.stats.speed}</p>
          </div>
        </div>

        <div className="flex gap-1">
          {isCompareMode && onToggleCompare && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleCompare(pokemon); }}
              className={cn(
                "p-2 rounded-full transition-all",
                isComparing ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <GitCompare className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick(pokemon)}
      className={cn(
        "group relative bg-card border border-border overflow-hidden cursor-pointer transition-all duration-300",
        "hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1",
        size.container,
        isComparing && "ring-2 ring-primary",
        isSelected && "ring-2 ring-primary/70 bg-primary/5"
      )}
    >
      {/* Action buttons */}
      <div className="absolute top-2 left-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isCompareMode && onToggleCompare && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleCompare(pokemon); }}
            className={cn(
              "p-1.5 rounded-full bg-background/80 backdrop-blur-sm transition-all",
              isComparing ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            <GitCompare className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Header with gradient based on type */}
      <div className={cn(
        "relative flex items-center justify-center",
        size.imageWrapper,
        `bg-gradient-to-br from-pokemon-${primaryType}/30 to-pokemon-${primaryType}/5`
      )}>
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-background/60 backdrop-blur-sm rounded-full text-xs font-mono text-muted-foreground">
          #{pokemon.id.toString().padStart(3, '0')}
        </div>
        <img
          src={pokemon.artwork || pokemon.sprite}
          alt={pokemon.name}
          className={cn(size.image, "object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110")}
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className={cn(size.padding, "space-y-2")}>
        <h3 className={cn(size.text, "font-semibold capitalize text-center")}>
          {pokemon.name}
        </h3>

        <div className="flex justify-center gap-1 flex-wrap">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className={cn(
                `type-${type}`,
                size.badge,
                "py-0.5 font-medium rounded-full capitalize"
              )}
            >
              {type}
            </span>
          ))}
        </div>

        {/* Mini stat bars - only for normal/large */}
        {size.stats && (
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <div className="text-center">
              <div className="h-1 bg-pokemon-grass/30 rounded-full overflow-hidden">
                <div className="h-full bg-pokemon-grass rounded-full" style={{ width: `${(pokemon.stats.hp / 255) * 100}%` }} />
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5">HP {pokemon.stats.hp}</p>
            </div>
            <div className="text-center">
              <div className="h-1 bg-pokemon-fire/30 rounded-full overflow-hidden">
                <div className="h-full bg-pokemon-fire rounded-full" style={{ width: `${(pokemon.stats.attack / 255) * 100}%` }} />
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5">ATK {pokemon.stats.attack}</p>
            </div>
            <div className="text-center">
              <div className="h-1 bg-pokemon-water/30 rounded-full overflow-hidden">
                <div className="h-full bg-pokemon-water rounded-full" style={{ width: `${(pokemon.stats.defense / 255) * 100}%` }} />
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5">DEF {pokemon.stats.defense}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PokemonCardSkeleton({ cardSize = 'normal' }: { cardSize?: CardSize }) {
  const heights = { compact: 'h-32', normal: 'h-48', large: 'h-56' };
  
  return (
    <div className={cn("bg-card rounded-2xl border border-border overflow-hidden animate-pulse", heights[cardSize])}>
      <div className="h-1/2 bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-20 bg-muted rounded mx-auto" />
        <div className="flex justify-center gap-1">
          <div className="h-4 w-12 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}
