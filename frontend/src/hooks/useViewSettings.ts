import { useState, useEffect } from 'react';

export type ViewMode = 'grid' | 'list';
export type CardSize = 'compact' | 'normal' | 'large';
export type SortField = 'id' | 'name' | 'hp' | 'attack' | 'defense' | 'speed' | 'total';
export type SortDirection = 'asc' | 'desc';

interface ViewSettings {
  viewMode: ViewMode;
  cardSize: CardSize;
  sortField: SortField;
  sortDirection: SortDirection;
}

const STORAGE_KEY = 'pokemon-view-settings';

const DEFAULT_SETTINGS: ViewSettings = {
  viewMode: 'grid',
  cardSize: 'normal',
  sortField: 'id',
  sortDirection: 'asc',
};

export function useViewSettings() {
  const [settings, setSettings] = useState<ViewSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setViewMode = (viewMode: ViewMode) => {
    setSettings(prev => ({ ...prev, viewMode }));
  };

  const setCardSize = (cardSize: CardSize) => {
    setSettings(prev => ({ ...prev, cardSize }));
  };

  const setSortField = (sortField: SortField) => {
    setSettings(prev => ({ ...prev, sortField }));
  };

  const setSortDirection = (sortDirection: SortDirection) => {
    setSettings(prev => ({ ...prev, sortDirection }));
  };

  const toggleSortDirection = () => {
    setSettings(prev => ({ 
      ...prev, 
      sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc' 
    }));
  };

  return {
    ...settings,
    setViewMode,
    setCardSize,
    setSortField,
    setSortDirection,
    toggleSortDirection,
  };
}
