import { useState, useEffect, useMemo, useCallback } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Pokemon, PokemonFilters, DEFAULT_FILTERS, GENERATION_RANGES } from '@/types/pokemon';
import { fetchPokemonBatch, fetchTotalCount, parseSearchQuery } from '@/services/api';
import { useDebounce } from './useDebounce';
import { SortField, SortDirection } from './useViewSettings';

const BATCH_SIZE = 50;

export function usePokemonSearch(
  searchQuery: string, 
  filters: PokemonFilters,
  sortField: SortField = 'id',
  sortDirection: SortDirection = 'asc',
  favoritesOnly: boolean = false,
  favoriteIds: number[] = []
) {
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: totalCount } = useQuery({
    queryKey: ['pokemon', 'count'],
    queryFn: fetchTotalCount,
    staleTime: 1000 * 60 * 60,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['pokemon', 'infinite'],
    queryFn: ({ pageParam = 0 }) => fetchPokemonBatch(BATCH_SIZE, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.flat().length;
      if (totalCount && loadedCount >= totalCount) return undefined;
      return loadedCount;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 60,
  });

  const allPokemon = useMemo(() => {
    return data?.pages.flat() ?? [];
  }, [data]);

  const filteredPokemon = useMemo(() => {
    if (!allPokemon.length) return [];

    let results = [...allPokemon];

    // Apply favorites filter first
    if (favoritesOnly) {
      results = results.filter(p => favoriteIds.includes(p.id));
    }

    // Apply search query (name, type, semantic)
    if (debouncedQuery.trim()) {
      const { nameQuery, typeFilters, semanticFilters } = parseSearchQuery(debouncedQuery);

      if (nameQuery) {
        results = results.filter(p => 
          p.name.toLowerCase().includes(nameQuery.toLowerCase())
        );
      }

      if (typeFilters.length > 0) {
        results = results.filter(p =>
          typeFilters.some(type => p.types.includes(type))
        );
      }

      for (const filter of semanticFilters) {
        results = results.filter(filter);
      }
    }

    // Apply type filters
    if (filters.types.length > 0) {
      results = results.filter(p =>
        filters.types.some(type => p.types.includes(type))
      );
    }

    // Apply generation filters
    if (filters.generations.length > 0) {
      results = results.filter(p => {
        return filters.generations.some(gen => {
          const range = GENERATION_RANGES[gen];
          return range && p.id >= range[0] && p.id <= range[1];
        });
      });
    }

    // Apply stat filters
    results = results.filter(p => {
      return (
        p.stats.hp >= filters.minHp && p.stats.hp <= filters.maxHp &&
        p.stats.attack >= filters.minAttack && p.stats.attack <= filters.maxAttack &&
        p.stats.defense >= filters.minDefense && p.stats.defense <= filters.maxDefense &&
        p.stats.speed >= filters.minSpeed && p.stats.speed <= filters.maxSpeed
      );
    });

    // Apply sorting
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'hp':
          comparison = a.stats.hp - b.stats.hp;
          break;
        case 'attack':
          comparison = a.stats.attack - b.stats.attack;
          break;
        case 'defense':
          comparison = a.stats.defense - b.stats.defense;
          break;
        case 'speed':
          comparison = a.stats.speed - b.stats.speed;
          break;
        case 'total':
          const totalA = Object.values(a.stats).reduce((sum, v) => sum + v, 0);
          const totalB = Object.values(b.stats).reduce((sum, v) => sum + v, 0);
          comparison = totalA - totalB;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return results;
  }, [allPokemon, debouncedQuery, filters, sortField, sortDirection, favoritesOnly, favoriteIds]);

  return {
    pokemon: filteredPokemon,
    isLoading,
    isFetchingNextPage,
    error,
    total: totalCount ?? 0,
    loadedCount: allPokemon.length,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
  };
}

export function usePokemonFilters() {
  const [filters, setFilters] = useState<PokemonFilters>(DEFAULT_FILTERS);

  const updateTypes = (types: string[]) => {
    setFilters(prev => ({ ...prev, types }));
  };

  const updateGenerations = (generations: number[]) => {
    setFilters(prev => ({ ...prev, generations }));
  };

  const updateStatRange = (
    stat: 'hp' | 'attack' | 'defense' | 'speed',
    min: number,
    max: number
  ) => {
    const minKey = `min${stat.charAt(0).toUpperCase() + stat.slice(1)}` as keyof PokemonFilters;
    const maxKey = `max${stat.charAt(0).toUpperCase() + stat.slice(1)}` as keyof PokemonFilters;
    setFilters(prev => ({ ...prev, [minKey]: min, [maxKey]: max }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return {
    filters,
    updateTypes,
    updateGenerations,
    updateStatRange,
    resetFilters,
  };
}
