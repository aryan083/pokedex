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
        filters.search = searchTerm;
    }

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