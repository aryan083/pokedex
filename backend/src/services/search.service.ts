import { PokemonFilters, SortField, SortOrder } from '../repositories/pokemon.repository';
import { RedisCache } from '../cache/redisCache';
import { logger } from '../middlewares/requestLogger.middleware';

export interface SearchParams {
  page?: number;
  limit?: number;
  type?: string;
  generation?: string; // Support comma-separated generations
  minHp?: number;
  minAttack?: number;
  minDefense?: number;
  minSpeed?: number;
  search?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

export class SearchService {
  private cache: RedisCache;

  constructor(cache: RedisCache) {
    this.cache = cache;
  }

  // Generate cache key for search queries
  private generateSearchCacheKey(params: SearchParams): string {
    const {
      page = 1,
      limit = 20,
      type,
      generation,
      minHp,
      minAttack,
      minDefense,
      minSpeed,
      search,
      sortBy = 'pokemonId',
      sortOrder = 'ASC'
    } = params;

    return `search:${page}:${limit}:${type || ''}:${generation || ''}:${minHp || ''}:${minAttack || ''}:${minDefense || ''}:${minSpeed || ''}:${search || ''}:${sortBy}:${sortOrder}`;
  }

  // Parse semantic terms in search query
  parseSemanticSearch(searchTerm: string): PokemonFilters {
    const term = searchTerm.toLowerCase().trim();
    const filters: PokemonFilters = {};

    // Handle exact semantic terms
    switch (term) {
      case 'fast':
        filters.minSpeed = 100;
        break;
      case 'tank':
        // This will be handled in the repository with a special filter
        filters.search = 'tank';
        break;
      case 'glass':
        filters.minAttack = 100;
        filters.minDefense = undefined; // Will be set to < 70 in repository
        break;
      default:
        // Handle multi-word queries and semantic interpretation
        filters.search = searchTerm;
    }

    return filters;
  }

  // Enhanced semantic search with closest match fallback
  parseEnhancedSemanticSearch(searchTerm: string): PokemonFilters {
    const originalTerm = searchTerm.toLowerCase().trim();
    const filters: PokemonFilters = {};

    // Handle exact semantic terms
    switch (originalTerm) {
      case 'fast':
        filters.minSpeed = 100;
        return filters;
      case 'tank':
        filters.search = 'tank';
        return filters;
      case 'glass':
        filters.minAttack = 100;
        filters.minDefense = undefined; // Will be set to < 70 in repository
        return filters;
    }

    // Tokenize the search term to handle multi-word queries
    const tokens = originalTerm.split(/\s+/);
    
    // Semantic mappings for common terms
    const semanticMappings: { [key: string]: string } = {
      'flame': 'fire',
      'firey': 'fire',
      'fiery': 'fire',
      'flaming': 'fire',
      'aqua': 'water',
      'watery': 'water',
      'bubble': 'water',
      'leaf': 'grass',
      'plant': 'grass',
      'bolt': 'electric',
      'shocking': 'electric',
      'spark': 'electric',
      'thunder': 'electric',
      'poisonous': 'poison',
      'venom': 'poison',
      'toxic': 'poison',
      'fighter': 'fighting',
      'battle': 'fighting',
      'sky': 'flying',
      'bird': 'flying',
      'earth': 'ground',
      'stone': 'rock',
      'insect': 'bug',
      'spirit': 'ghost',
      'spooky': 'ghost',
      'metal': 'steel',
      'iron': 'steel',
    };

    // Check each token for semantic matches
    let hasTypeMatch = false;
    let matchedType = '';
    
    for (const token of tokens) {
      if (semanticMappings[token]) {
        matchedType = semanticMappings[token];
        hasTypeMatch = true;
        break; // Use the first type match found
      }
    }

    // If we found a semantic type match
    if (hasTypeMatch) {
      // If the query also mentions 'type', it's definitely a type search
      if (tokens.includes('type')) {
        filters.type = matchedType;
        return filters;
      } else {
        // Otherwise, try both name and type matching
        filters.search = originalTerm;
        // We'll handle the type fallback in the repository
        (filters as any).preferredType = matchedType; 
        return filters;
      }
    }

    // If no semantic match found, return the original search term
    filters.search = originalTerm;
    return filters;
  }

  // Get cached search results
  async getCachedResults(params: SearchParams): Promise<any> {
    const cacheKey = this.generateSearchCacheKey(params);
    return await this.cache.get(cacheKey);
  }

  // Cache search results
  async cacheResults(params: SearchParams, results: any): Promise<void> {
    const cacheKey = this.generateSearchCacheKey(params);
    // Short TTL for search results (5 minutes)
    await this.cache.set(cacheKey, results, 300);
  }

  // Validate search parameters
  validateSearchParams(params: SearchParams): SearchParams {
    const validatedParams: SearchParams = {
      page: Math.max(1, params.page || 1),
      limit: Math.min(100, Math.max(1, params.limit || 20)),
      type: params.type,
      generation: params.generation,
      minHp: params.minHp,
      minAttack: params.minAttack,
      minDefense: params.minDefense,
      minSpeed: params.minSpeed,
      search: params.search,
      sortBy: params.sortBy || 'pokemonId',
      sortOrder: params.sortOrder || 'ASC'
    };

    // Ensure sort field is valid
    const validSortFields: SortField[] = ['pokemonId', 'name', 'hp', 'attack', 'defense', 'speed'];
    if (validatedParams.sortBy && !validSortFields.includes(validatedParams.sortBy)) {
      validatedParams.sortBy = 'pokemonId';
    }

    // Ensure sort order is valid
    if (validatedParams.sortOrder && !['ASC', 'DESC'].includes(validatedParams.sortOrder)) {
      validatedParams.sortOrder = 'ASC';
    }

    return validatedParams;
  }
}