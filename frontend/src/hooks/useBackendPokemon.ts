import { useState, useEffect, useCallback } from 'react';
import { Pokemon } from '@/types/pokemon';
import { searchPokemon, comparePokemon, healthCheck } from '@/services/backendApi';

interface UsePokemonReturn {
  pokemons: Pokemon[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  search: (params: {
    query?: string;
    type?: string;
    generation?: number;
    minHp?: number;
    minAttack?: number;
    minDefense?: number;
    minSpeed?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
  }) => Promise<void>;
}

interface UseCompareReturn {
  compare: (pokemonNames: string[]) => Promise<Pokemon[]>;
  loading: boolean;
  error: string | null;
}

export function useBackendPokemon(): UsePokemonReturn {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const search = useCallback(async (params: {
    search?: string;
    type?: string;
    generation?: string;
    minHp?: number;
    minAttack?: number;
    minDefense?: number;
    minSpeed?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await searchPokemon({
        search: params.search,
        type: params.type,
        generation: params.generation ? parseInt(params.generation) : undefined,
        minHp: params.minHp,
        minAttack: params.minAttack,
        minDefense: params.minDefense,
        minSpeed: params.minSpeed,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        page: params.page,
        limit: params.limit,
      });
      
      // For pagination, either replace or append results
      if (params.page === 1) {
        // First page, replace all
        setPokemons(result.pokemons);
      } else {
        // Subsequent pages, append
        setPokemons(prev => [...prev, ...result.pokemons]);
      }
      
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setCurrentPage(result.currentPage);
    } catch (err: any) {
      setError(err.message || 'Failed to search Pokémon');
      if (params.page === 1) {
        setPokemons([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pokemons,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    search,
  };
}

export function useBackendCompare(): UseCompareReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const compare = useCallback(async (pokemonNames: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await comparePokemon(pokemonNames);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to compare Pokémon');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    compare,
    loading,
    error,
  };
}

export function useBackendHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkHealth = async () => {
      setLoading(true);
      try {
        const result = await healthCheck();
        setIsHealthy(result);
      } catch {
        setIsHealthy(false);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return { isHealthy, loading };
}