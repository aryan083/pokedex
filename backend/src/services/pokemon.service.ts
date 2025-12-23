import { Pokemon } from "../models";
import { PokemonRepository } from "../repositories/pokemon.repository";
import { SearchService, SearchParams } from "./search.service";
import { RedisCache } from "../cache/redisCache";
import { logger } from "../middlewares/requestLogger.middleware";
import { PaginationMeta, successResponse } from "../utils/response";

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
      const cachedResults = await this.searchService.getCachedResults(
        validatedParams
      );
      if (cachedResults) {
        logger.info(`Returning cached results for search query`);
        return cachedResults;
      }

      let searchResult;

      if (validatedParams.search) {
        // Try vector search first for semantic queries
        try {
          const vectorSearchResult = await this.repository.findWithVectorSearch(
            validatedParams.search,
            {
              limit: validatedParams.limit,
              threshold: 0.6, // Lower threshold for more inclusive results
              hybridSearch: true,
              filters: {
                type: validatedParams.type,
                generation: validatedParams.generation,
                minHp: validatedParams.minHp,
                minAttack: validatedParams.minAttack,
                minDefense: validatedParams.minDefense,
                minSpeed: validatedParams.minSpeed,
              },
            }
          );

          // If vector search returns good results, use them
          if (
            vectorSearchResult.pokemons.length > 0 &&
            vectorSearchResult.searchMetadata.averageSimilarity > 0.5
          ) {
            searchResult = {
              pokemons: vectorSearchResult.pokemons,
              totalCount: vectorSearchResult.totalCount,
              usedFallback: false,
              searchMetadata: vectorSearchResult.searchMetadata,
            };

            logger.info(
              `Vector search successful with ${vectorSearchResult.pokemons.length} results`
            );
          } else {
            throw new Error("Vector search returned low-quality results");
          }
        } catch (vectorError: any) {
          logger.info(
            `Vector search failed: ${vectorError.message}, falling back to semantic search`
          );

          // Fallback to enhanced semantic search
          const semanticParsing = this.searchService.parseSemanticSearch(
            validatedParams.search
          );

          const primaryFilters = {
            ...semanticParsing.primaryFilters,
            type: validatedParams.type,
            generation: validatedParams.generation,
            minHp:
              validatedParams.minHp || semanticParsing.primaryFilters.minHp,
            minAttack:
              validatedParams.minAttack ||
              semanticParsing.primaryFilters.minAttack,
            minDefense:
              validatedParams.minDefense ||
              semanticParsing.primaryFilters.minDefense,
            minSpeed:
              validatedParams.minSpeed ||
              semanticParsing.primaryFilters.minSpeed,
            maxDefense: semanticParsing.primaryFilters.maxDefense,
          };

          const fallbackFilters = {
            ...semanticParsing.fallbackFilters,
            type: validatedParams.type,
            generation: validatedParams.generation,
            minHp:
              validatedParams.minHp || semanticParsing.fallbackFilters.minHp,
            minAttack:
              validatedParams.minAttack ||
              semanticParsing.fallbackFilters.minAttack,
            minDefense:
              validatedParams.minDefense ||
              semanticParsing.fallbackFilters.minDefense,
            minSpeed:
              validatedParams.minSpeed ||
              semanticParsing.fallbackFilters.minSpeed,
            maxDefense: semanticParsing.fallbackFilters.maxDefense,
          };

          // Use tiered search if we have semantic intent
          if (semanticParsing.hasSemanticIntent) {
            const tieredResult = await this.repository.findWithTieredSearch(
              primaryFilters,
              fallbackFilters,
              validatedParams.page!,
              validatedParams.limit!,
              validatedParams.sortBy!,
              validatedParams.sortOrder!
            );

            searchResult = {
              pokemons: tieredResult.pokemons,
              totalCount: tieredResult.totalCount,
              usedFallback: tieredResult.usedFallback,
              searchMetadata: {
                usedVectorSearch: false,
                averageSimilarity: 0,
                searchType: "semantic_tiered",
              },
            };
          } else {
            // Regular search for non-semantic queries
            const regularResult = await this.repository.findAll(
              primaryFilters,
              validatedParams.page!,
              validatedParams.limit!,
              validatedParams.sortBy!,
              validatedParams.sortOrder!
            );

            searchResult = {
              pokemons: regularResult.pokemons,
              totalCount: regularResult.totalCount,
              usedFallback: false,
              searchMetadata: {
                usedVectorSearch: false,
                averageSimilarity: 0,
                searchType: "traditional",
              },
            };
          }
        }
      } else {
        // No search term, use regular filtering
        const filters = {
          type: validatedParams.type,
          generation: validatedParams.generation,
          minHp: validatedParams.minHp,
          minAttack: validatedParams.minAttack,
          minDefense: validatedParams.minDefense,
          minSpeed: validatedParams.minSpeed,
        };

        const regularResult = await this.repository.findAll(
          filters,
          validatedParams.page!,
          validatedParams.limit!,
          validatedParams.sortBy!,
          validatedParams.sortOrder!
        );

        searchResult = {
          pokemons: regularResult.pokemons,
          totalCount: regularResult.totalCount,
          usedFallback: false,
          searchMetadata: {
            usedVectorSearch: false,
            averageSimilarity: 0,
            searchType: "filter_only",
          },
        };
      }

      // Prepare pagination metadata
      const meta: PaginationMeta = {
        page: validatedParams.page!,
        limit: validatedParams.limit!,
        total: searchResult.totalCount,
        totalPages: Math.ceil(searchResult.totalCount / validatedParams.limit!),
      };

      // Add enhanced search metadata
      const enhancedMeta = {
        ...meta,
        usedSemanticFallback: searchResult.usedFallback,
        searchMetadata: searchResult.searchMetadata,
      };

      // Format response
      const response = successResponse(searchResult.pokemons, enhancedMeta);

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
      const cacheKey = `compare:${request.pokemon.sort().join(",")}`;

      // Check cache first
      const cachedResults = await this.cache.get(cacheKey);
      if (cachedResults) {
        logger.info(`Returning cached results for comparison`);
        return cachedResults;
      }

      // Validate request
      if (
        !request.pokemon ||
        request.pokemon.length < 2 ||
        request.pokemon.length > 3
      ) {
        throw new Error("Must provide 2-3 Pokémon for comparison");
      }

      // Fetch Pokémon data
      let pokemons: (Pokemon | null)[] = [];

      // Check if all inputs are numbers (IDs)
      const areAllNumbers = request.pokemon.every((p) => /^\d+$/.test(p));

      if (areAllNumbers) {
        // Fetch by IDs
        const ids = request.pokemon.map((id) => parseInt(id, 10));
        pokemons = await Promise.all(
          ids.map((id) => this.repository.findById(id))
        );
      } else {
        // Fetch by names
        pokemons = await this.repository.findByNames(request.pokemon);
      }

      // Filter out null results
      const validPokemons = pokemons.filter(
        (pokemon): pokemon is Pokemon => pokemon !== null
      );

      // Check if we found all requested Pokémon
      if (validPokemons.length !== request.pokemon.length) {
        throw new Error("One or more Pokémon not found");
      }

      // Prepare comparison data
      const comparisonData: PokemonComparisonData[] = validPokemons.map(
        (pokemon) => ({
          pokemonId: pokemon.pokemonId,
          name: pokemon.name,
          hp: pokemon.hp,
          attack: pokemon.attack,
          defense: pokemon.defense,
          speed: pokemon.speed,
        })
      );

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
