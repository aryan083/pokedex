import { Pokemon, PokemonStats } from '@/types/pokemon';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

interface PokeAPIStats {
  base_stat: number;
  stat: { name: string };
}

interface PokeAPIType {
  type: { name: string };
}

interface PokeAPIAbility {
  ability: { name: string };
}

interface PokeAPIPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  stats: PokeAPIStats[];
  types: PokeAPIType[];
  abilities: PokeAPIAbility[];
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
}

function parseStats(stats: PokeAPIStats[]): PokemonStats {
  const statMap: Record<string, keyof PokemonStats> = {
    'hp': 'hp',
    'attack': 'attack',
    'defense': 'defense',
    'special-attack': 'specialAttack',
    'special-defense': 'specialDefense',
    'speed': 'speed',
  };

  return stats.reduce((acc, stat) => {
    const key = statMap[stat.stat.name];
    if (key) {
      acc[key] = stat.base_stat;
    }
    return acc;
  }, {} as PokemonStats);
}

function transformPokemon(data: PokeAPIPokemon): Pokemon {
  return {
    id: data.id,
    name: data.name,
    types: data.types.map(t => t.type.name),
    stats: parseStats(data.stats),
    height: data.height / 10, // Convert to meters
    weight: data.weight / 10, // Convert to kg
    sprite: data.sprites.front_default,
    artwork: data.sprites.other['official-artwork'].front_default,
    abilities: data.abilities.map(a => a.ability.name),
  };
}

export async function fetchPokemonList(limit: number = 151, offset: number = 0): Promise<{ name: string; url: string; total: number }[]> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon?limit=${limit}&offset=${offset}`);
  const data = await response.json();
  return data.results.map((r: { name: string; url: string }) => ({ ...r, total: data.count }));
}

export async function fetchPokemonDetails(nameOrId: string | number): Promise<Pokemon> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon/${nameOrId}`);
  const data: PokeAPIPokemon = await response.json();
  return transformPokemon(data);
}

export async function fetchTotalCount(): Promise<number> {
  const response = await fetch(`${POKEAPI_BASE}/pokemon?limit=1`);
  const data = await response.json();
  return data.count;
}

export async function fetchPokemonBatch(limit: number, offset: number): Promise<Pokemon[]> {
  const list = await fetchPokemonList(limit, offset);
  const promises = list.map((pokemon) => fetchPokemonDetails(pokemon.name));
  return Promise.all(promises);
}

export async function fetchAllPokemon(limit: number = 151): Promise<Pokemon[]> {
  const list = await fetchPokemonList(limit);
  const promises = list.map((pokemon) => fetchPokemonDetails(pokemon.name));
  return Promise.all(promises);
}

// Semantic search keywords mapping
const SEMANTIC_KEYWORDS: Record<string, (p: Pokemon) => boolean> = {
  fast: (p) => p.stats.speed > 100,
  slow: (p) => p.stats.speed < 50,
  tank: (p) => p.stats.hp + p.stats.defense > 180,
  glass: (p) => p.stats.attack > 100 && p.stats.defense < 60,
  heavy: (p) => p.weight > 100,
  light: (p) => p.weight < 10,
  tiny: (p) => p.height < 0.5,
  huge: (p) => p.height > 2,
  strong: (p) => p.stats.attack > 100,
  weak: (p) => p.stats.attack < 50,
  bulky: (p) => p.stats.hp > 100,
  speedy: (p) => p.stats.speed > 110,
};

export function parseSearchQuery(query: string): { 
  nameQuery: string; 
  typeFilters: string[]; 
  semanticFilters: ((p: Pokemon) => boolean)[] 
} {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const typeFilters: string[] = [];
  const semanticFilters: ((p: Pokemon) => boolean)[] = [];
  const nameWords: string[] = [];

  const types = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 
    'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 
    'dark', 'steel', 'fairy'];

  for (const word of words) {
    if (types.includes(word)) {
      typeFilters.push(word);
    } else if (SEMANTIC_KEYWORDS[word]) {
      semanticFilters.push(SEMANTIC_KEYWORDS[word]);
    } else {
      nameWords.push(word);
    }
  }

  return {
    nameQuery: nameWords.join(' '),
    typeFilters,
    semanticFilters,
  };
}
