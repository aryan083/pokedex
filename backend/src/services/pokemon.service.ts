import { Pokemon } from '../models';
import { PokemonRepository } from '../repositories/pokemon.repository';
import { SearchService, SearchParams } from './search.service';
import { RedisCache } from '../cache/redisCache';
import { logger } from '../middlewares/requestLogger.middleware';
import { PaginationMeta, successResponse } from '../utils/response';

export interface ComparePokemonRequest {
  pokemon: string[]; // Names or IDs
}

export interface PokemonComparisonData {
  pokemonId: number;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

export class PokemonService {
  private repository: PokemonRepository;
  private searchService: SearchService;
  private cache: RedisCache;

  constructor(
    repository: PokemonRepository,
    searchService: SearchService,
    cache: RedisCache
  ) {
    this.repository = repository;
    this.searchService = searchService;
    this.cache = cache;
  }

  async searchPokemons(params: SearchParams) {
    try {
      // Validate and sanitize parameters
      const validatedParams = this.searchService.validateSearchParams(params);
      
      // Check cache first
      const cachedResults = await this.searchService.getCachedResults(validatedParams);
      if (cachedResults) {
        logger.info(`Returning cached results for search query`);
        return cachedResults;
      }

      // Parse semantic search terms
      let filters = {};
      if (validatedParams.search) {
        filters = this.searchService.parseSemanticSearch(validatedParams.search);
      }

      // Merge filters with other parameters
      const searchFilters = {
        ...filters,
        type: validatedParams.type,
        generation: validatedParams.generation,
        minHp: validatedParams.minHp,
        minAttack: validatedParams.minAttack,
        minDefense: validatedParams.minDefense,
        minSpeed: validatedParams.minSpeed,
        search: validatedParams.search, // Include search parameter
      };

      // Perform search
      const { pokemons, totalCount } = await this.repository.findAll(
        searchFilters,
        validatedParams.page!,
        validatedParams.limit!,
        validatedParams.sortBy!,
        validatedParams.sortOrder!
      );

      // Prepare pagination metadata
      const meta: PaginationMeta = {
        page: validatedParams.page!,
        limit: validatedParams.limit!,
        total: totalCount,
        totalPages: Math.ceil(totalCount / validatedParams.limit!)
      };

      // Format response
      const response = successResponse(pokemons, meta);

      // Cache results
      await this.searchService.cacheResults(validatedParams, response);

      return response;
    } catch (error: any) {
      logger.error(`Error in PokemonService.searchPokemons: ${error.message}`);
      throw error;
    }
  }

  async comparePokemons(request: ComparePokemonRequest) {
    try {
      // Generate cache key
      const cacheKey = `compare:${request.pokemon.sort().join(',')}`;
      
      // Check cache first
      const cachedResults = await this.cache.get(cacheKey);
      if (cachedResults) {
        logger.info(`Returning cached results for comparison`);
        return cachedResults;
      }

      // Validate request
      if (!request.pokemon || request.pokemon.length < 2 || request.pokemon.length > 3) {
        throw new Error('Must provide 2-3 Pokémon for comparison');
      }

      // Fetch Pokémon data
      let pokemons: (Pokemon | null)[] = [];
      
      // Check if all inputs are numbers (IDs)
      const areAllNumbers = request.pokemon.every(p => /^\d+$/.test(p));
      
      if (areAllNumbers) {
        // Fetch by IDs
        const ids = request.pokemon.map(id => parseInt(id, 10));
        pokemons = await Promise.all(ids.map(id => this.repository.findById(id)));
      } else {
        // Fetch by names
        pokemons = await this.repository.findByNames(request.pokemon);
      }

      // Filter out null results
      const validPokemons = pokemons.filter((pokemon): pokemon is Pokemon => pokemon !== null);

      // Check if we found all requested Pokémon
      if (validPokemons.length !== request.pokemon.length) {
        throw new Error('One or more Pokémon not found');
      }

      // Prepare comparison data
      const comparisonData: PokemonComparisonData[] = validPokemons.map(pokemon => ({
        pokemonId: pokemon.pokemonId,
        name: pokemon.name,
        hp: pokemon.hp,
        attack: pokemon.attack,
        defense: pokemon.defense,
        speed: pokemon.speed,
      }));

      // Format response
      const response = successResponse(comparisonData);

      // Cache results with longer TTL (1 hour)
      await this.cache.set(cacheKey, response, 3600);

      return response;
    } catch (error: any) {
      logger.error(`Error in PokemonService.comparePokemons: ${error.message}`);
      throw error;
    }
  }

  async seedPokemonData(pokemonData: any[]) {
    try {
      logger.info(`Seeding ${pokemonData.length} Pokémon`);
      const result = await this.repository.bulkCreate(pokemonData);
      logger.info(`Successfully seeded ${result.length} Pokémon`);
      return result;
    } catch (error: any) {
      logger.error(`Error in PokemonService.seedPokemonData: ${error.message}`);
      throw error;
    }
  }
}