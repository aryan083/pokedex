import {
  PokemonFilters,
  SortField,
  SortOrder,
} from "../repositories/pokemon.repository";
import { RedisCache } from "../cache/redisCache";
import { logger } from "../middlewares/requestLogger.middleware";
import { SemanticSearchService } from "./semantic.service";

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
  private semanticService: SemanticSearchService;

  constructor(cache: RedisCache) {
    this.cache = cache;
    this.semanticService = new SemanticSearchService();
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
      sortBy = "pokemonId",
      sortOrder = "ASC",
    } = params;

    return `search:${page}:${limit}:${type || ""}:${generation || ""}:${
      minHp || ""
    }:${minAttack || ""}:${minDefense || ""}:${minSpeed || ""}:${
      search || ""
    }:${sortBy}:${sortOrder}`;
  }

  // Enhanced semantic search parsing
  parseSemanticSearch(searchTerm: string): {
    primaryFilters: PokemonFilters;
    fallbackFilters: PokemonFilters;
    hasSemanticIntent: boolean;
  } {
    if (!searchTerm || !searchTerm.trim()) {
      return {
        primaryFilters: {},
        fallbackFilters: {},
        hasSemanticIntent: false,
      };
    }

    // Use the semantic service to analyze the query
    const semanticAnalysis =
      this.semanticService.parseSemanticQuery(searchTerm);
    this.semanticService.logSemanticAnalysis(semanticAnalysis);

    const semanticFilters =
      this.semanticService.generateSemanticFilters(semanticAnalysis);

    // Build primary filters (exact + semantic)
    const primaryFilters: PokemonFilters = {};

    // Add semantic characteristics
    if (semanticFilters.characteristics) {
      Object.assign(primaryFilters, semanticFilters.characteristics);
    }

    // Add semantic types
    if (semanticFilters.types && semanticFilters.types.length > 0) {
      primaryFilters.types = semanticFilters.types;
    }

    // Add text search
    if (semanticFilters.textSearch) {
      primaryFilters.search = semanticFilters.textSearch;
    }

    // Build fallback filters (semantic only, no text)
    const fallbackFilters: PokemonFilters = {};

    // Add fallback types
    if (
      semanticFilters.fallbackTypes &&
      semanticFilters.fallbackTypes.length > 0
    ) {
      fallbackFilters.types = semanticFilters.fallbackTypes;
    }

    // Add characteristics to fallback too
    if (semanticFilters.characteristics) {
      Object.assign(fallbackFilters, semanticFilters.characteristics);
    }

    const hasSemanticIntent = semanticAnalysis.semanticMatches.length > 0;

    logger.info(
      `Search filters generated for query "${searchTerm}": primary=${JSON.stringify(
        primaryFilters
      )}, fallback=${JSON.stringify(
        fallbackFilters
      )}, hasSemanticIntent=${hasSemanticIntent}`
    );

    return {
      primaryFilters,
      fallbackFilters,
      hasSemanticIntent,
    };
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
      sortBy: params.sortBy || "pokemonId",
      sortOrder: params.sortOrder || "ASC",
    };

    // Ensure sort field is valid
    const validSortFields: SortField[] = [
      "pokemonId",
      "name",
      "hp",
      "attack",
      "defense",
      "speed",
    ];
    if (
      validatedParams.sortBy &&
      !validSortFields.includes(validatedParams.sortBy)
    ) {
      validatedParams.sortBy = "pokemonId";
    }

    // Ensure sort order is valid
    if (
      validatedParams.sortOrder &&
      !["ASC", "DESC"].includes(validatedParams.sortOrder)
    ) {
      validatedParams.sortOrder = "ASC";
    }

    return validatedParams;
  }
}
