import { useEffect, useCallback } from 'react';
import { Pokemon } from '@/types/pokemon';

interface UseKeyboardShortcutsProps {
  pokemon: Pokemon[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  onPokemonClick: (pokemon: Pokemon) => void;
  isCompareMode: boolean;
  onToggleCompare: (pokemon: Pokemon) => void;
  onToggleCompareMode: () => void;
  gridColumns: number;
}

export function useKeyboardShortcuts({
  pokemon,
  selectedIndex,
  setSelectedIndex,
  onPokemonClick,
  isCompareMode,
  onToggleCompare,
  onToggleCompareMode,
  gridColumns,
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const currentPokemon = pokemon[selectedIndex];

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setSelectedIndex(Math.min(selectedIndex + 1, pokemon.length - 1));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setSelectedIndex(Math.max(selectedIndex - 1, 0));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(Math.min(selectedIndex + gridColumns, pokemon.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(Math.max(selectedIndex - gridColumns, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (currentPokemon) {
          onPokemonClick(currentPokemon);
        }
        break;
      case 'c':
      case 'C':
        e.preventDefault();
        if (e.shiftKey) {
          onToggleCompareMode();
        } else if (isCompareMode && currentPokemon) {
          onToggleCompare(currentPokemon);
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (isCompareMode) {
          onToggleCompareMode();
        }
        break;
    }
  }, [pokemon, selectedIndex, setSelectedIndex, onPokemonClick, isCompareMode, onToggleCompare, onToggleCompareMode, gridColumns]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { selectedIndex };
}
