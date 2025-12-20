import { useState, useCallback } from 'react';
import { Pokemon } from '@/types/pokemon';

const MAX_COMPARE = 3;

export function useCompare() {
  const [compareList, setCompareList] = useState<Pokemon[]>([]);
  const [isCompareMode, setIsCompareMode] = useState(false);

  const addToCompare = useCallback((pokemon: Pokemon) => {
    setCompareList(prev => {
      if (prev.find(p => p.id === pokemon.id)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, pokemon];
    });
  }, []);

  const removeFromCompare = useCallback((pokemonId: number) => {
    setCompareList(prev => prev.filter(p => p.id !== pokemonId));
  }, []);

  const isInCompare = useCallback((pokemonId: number) => {
    return compareList.some(p => p.id === pokemonId);
  }, [compareList]);

  const toggleCompare = useCallback((pokemon: Pokemon) => {
    if (isInCompare(pokemon.id)) {
      removeFromCompare(pokemon.id);
    } else {
      addToCompare(pokemon);
    }
  }, [isInCompare, removeFromCompare, addToCompare]);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const toggleCompareMode = useCallback(() => {
    setIsCompareMode(prev => {
      if (prev) {
        // Exiting compare mode - clear the list
        setCompareList([]);
      }
      return !prev;
    });
  }, []);

  return {
    compareList,
    isCompareMode,
    maxCompare: MAX_COMPARE,
    addToCompare,
    removeFromCompare,
    isInCompare,
    toggleCompare,
    clearCompare,
    toggleCompareMode,
  };
}
