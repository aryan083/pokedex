import { Pokemon, PokemonStats } from '@/types/pokemon';

const BACKEND_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface BackendPokemon {
  pokemonId: number;
  name: string;
  generation: number;
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
  searchText: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: any;
  message?: string;
}

interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  generation?: number;
  minHp?: number;
  minAttack?: number;
  minDefense?: number;
  minSpeed?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Transform backend Pokemon to frontend Pokemon format
function transformPokemon(data: BackendPokemon): Pokemon {
  // Generate placeholder images using the Pokemon ID
  const pokemonId = data.pokemonId;
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
  const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  
  return {
    id: data.pokemonId,
    name: data.name,
    types: data.types,
    stats: {
      hp: data.hp,
      attack: data.attack,
      defense: data.defense,
      specialAttack: data.specialAttack,
      specialDefense: data.specialDefense,
      speed: data.speed,
    },
    height: data.height,
    weight: data.weight,
    sprite: spriteUrl,
    artwork: artworkUrl,
    abilities: data.abilities,
  };
}

// Search Pokémon with various filters
export async function searchPokemon(params: SearchParams): Promise<{ 
  pokemons: Pokemon[]; 
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  
  const response = await fetch(`${BACKEND_API_BASE}/pokemon?${queryParams.toString()}`);
  const result: ApiResponse<BackendPokemon[]> = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch Pokémon');
  }
  
  const pokemons = (result.data || []).map(transformPokemon);
  
  return {
    pokemons,
    totalCount: result.meta?.total || 0,
    totalPages: result.meta?.totalPages || 0,
    currentPage: result.meta?.page || 1,
  };
}

// Compare Pokémon by name or ID
export async function comparePokemon(pokemonNames: string[]): Promise<Pokemon[]> {
  const response = await fetch(`${BACKEND_API_BASE}/pokemon/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pokemon: pokemonNames }),
  });
  
  const result: ApiResponse<BackendPokemon[]> = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to compare Pokémon');
  }
  
  return (result.data || []).map(transformPokemon);
}

// Get Pokémon by ID
export async function getPokemonById(id: number): Promise<Pokemon | null> {
  // Since our backend doesn't have a direct endpoint for getting a single Pokémon by ID,
  // we'll search for it
  const result = await searchPokemon({ search: id.toString() });
  return result.pokemons.find(p => p.id === id) || null;
}

// Get Pokémon by name
export async function getPokemonByName(name: string): Promise<Pokemon | null> {
  // Since our backend doesn't have a direct endpoint for getting a single Pokémon by name,
  // we'll search for it
  const result = await searchPokemon({ search: name });
  return result.pokemons.find(p => p.name === name) || null;
}

// Health check
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_API_BASE}/pokemon/health`);
    return response.ok;
  } catch {
    return false;
  }
}