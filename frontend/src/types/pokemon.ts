export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  stats: PokemonStats;
  height: number;
  weight: number;
  sprite: string;
  artwork: string;
  abilities: string[];
}

export interface PokemonFilters {
  types: string[];
  generations: number[];
  minHp: number;
  maxHp: number;
  minAttack: number;
  maxAttack: number;
  minDefense: number;
  maxDefense: number;
  minSpeed: number;
  maxSpeed: number;
}

export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const;

export type PokemonType = typeof POKEMON_TYPES[number];

export const DEFAULT_FILTERS: PokemonFilters = {
  types: [],
  generations: [],
  minHp: 0,
  maxHp: 100,
  minAttack: 0,
  maxAttack: 100,
  minDefense: 0,
  maxDefense: 100,
  minSpeed: 0,
  maxSpeed: 100,
};

// Generation ranges for filtering by Pokemon ID
export const GENERATION_RANGES: Record<number, [number, number]> = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 905],
  9: [906, 1025],
};
