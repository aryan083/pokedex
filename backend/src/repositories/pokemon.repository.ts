import { Op, WhereOptions } from "sequelize";
import { Pokemon } from "../models";
import { logger } from "../middlewares/requestLogger.middleware";
import { VectorSearchService } from "../services/vector-search.service";
import { EmbeddingService } from "../services/embedding.service";

// Define filter criteria interface
export interface PokemonFilters {
  type?: string; // Comma-separated string of types
  types?: string[]; // Array of types for semantic search
  generation?: string; // Comma-separated string of generations
  minHp?: number;
  minAttack?: number;
  minDefense?: number;
  minSpeed?: number;
  maxDefense?: number; // For glass cannon filtering
  search?: string;
}

// Define sorting options
export type SortField =
  | "pokemonId"
  | "name"
  | "hp"
  | "attack"
  | "defense"
  | "speed";
export type SortOrder = "ASC" | "DESC";

export interface PokemonRepository {
  findAll(
    filters: PokemonFilters,
    page: number,
    limit: number,
    sortField: SortField,
    sortOrder: SortOrder
  ): Promise<{ pokemons: Pokemon[]; totalCount: number }>;
  findWithTieredSearch(
    primaryFilters: PokemonFilters,
    fallbackFilters: PokemonFilters,
    page: number,
    limit: number,
    sortField: SortField,
    sortOrder: SortOrder
  ): Promise<{
    pokemons: Pokemon[];
    totalCount: number;
    usedFallback: boolean;
  }>;
  findWithVectorSearch(
    query: string,
    options?: {
      limit?: number;
      threshold?: number;
      hybridSearch?: boolean;
      filters?: PokemonFilters;
    }
  ): Promise<{
    pokemons: Pokemon[];
    totalCount: number;
    searchMetadata: {
      usedVectorSearch: boolean;
      averageSimilarity: number;
      searchType: string;
    };
  }>;
  findById(id: number): Promise<Pokemon | null>;
  findByName(name: string): Promise<Pokemon | null>;
  findByNames(names: string[]): Promise<Pokemon[]>;
  bulkCreate(pokemons: any[]): Promise<Pokemon[]>;
  count(): Promise<number>;
}

export class PokemonRepositoryImpl implements PokemonRepository {
  private vectorSearchService: VectorSearchService;

  constructor() {
    const embeddingService = new EmbeddingService();
    this.vectorSearchService = new VectorSearchService(embeddingService);
  }
  async findAll(
    filters: PokemonFilters,
    page: number,
    limit: number,
    sortField: SortField,
    sortOrder: SortOrder
  ): Promise<{ pokemons: Pokemon[]; totalCount: number }> {
    try {
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions: WhereOptions = {};

      // Handle multiple generations
      if (filters.generation) {
        const generations = filters.generation
          .split(",")
          .map((g) => parseInt(g.trim(), 10))
          .filter((g) => !isNaN(g));
        if (generations.length > 0) {
          whereConditions.generation = { [Op.in]: generations };
        }
      }

      if (filters.minHp !== undefined) {
        whereConditions.hp = { [Op.gte]: filters.minHp };
      }

      if (filters.minAttack !== undefined) {
        whereConditions.attack = { [Op.gte]: filters.minAttack };
      }

      if (filters.minDefense !== undefined) {
        whereConditions.defense = { [Op.gte]: filters.minDefense };
      }

      if (filters.maxDefense !== undefined) {
        whereConditions.defense = whereConditions.defense
          ? { ...whereConditions.defense, [Op.lte]: filters.maxDefense }
          : { [Op.lte]: filters.maxDefense };
      }

      if (filters.minSpeed !== undefined) {
        whereConditions.speed = { [Op.gte]: filters.minSpeed };
      }

      // Handle multiple type filters (array field)
      let typeCondition = {};

      // Priority: types array (semantic) over type string (legacy)
      if (filters.types && filters.types.length > 0) {
        typeCondition = {
          types: {
            [Op.overlap]: filters.types,
          },
        };
      } else if (filters.type) {
        const types = filters.type
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        if (types.length > 0) {
          // For PostgreSQL array field, we need to check if any of the types are contained
          // Using overlap operator ([Op.overlap]) to check if arrays have any elements in common
          // This will find Pokémon that have ANY of the specified types
          typeCondition = {
            types: {
              [Op.overlap]: types,
            },
          };
        }
      }

      // Handle search filter
      let searchCondition = {};
      if (filters.search) {
        // Regular text search using ILIKE for name matching
        const searchTerm = filters.search.toLowerCase().trim();
        logger.info(`Processing search term: ${searchTerm}`);

        searchCondition = {
          name: { [Op.iLike]: `%${searchTerm}%` },
        };
        logger.info(
          `Search condition created: ${JSON.stringify(searchCondition)}`
        );
      }

      // Combine all conditions except for tank
      const conditionsToCombine = [
        whereConditions,
        typeCondition,
        searchCondition,
      ].filter((condition) => Object.keys(condition).length > 0);

      logger.info(
        `Conditions to combine: ${JSON.stringify(conditionsToCombine)}`
      );

      const finalWhere =
        conditionsToCombine.length > 0 ? { [Op.and]: conditionsToCombine } : {};

      logger.info(`Final WHERE clause: ${JSON.stringify(finalWhere)}`);

      const { count, rows } = await Pokemon.findAndCountAll({
        where: finalWhere,
        order: [[sortField, sortOrder]],
        limit,
        offset,
      });

      return {
        pokemons: rows,
        totalCount: count,
      };
    } catch (error: any) {
      logger.error(`Error in PokemonRepository.findAll: ${error.message}`);
      throw error;
    }
  }

  async findById(id: number): Promise<Pokemon | null> {
    try {
      return await Pokemon.findByPk(id);
    } catch (error: any) {
      logger.error(`Error in PokemonRepository.findById: ${error.message}`);
      throw error;
    }
  }

  async findByName(name: string): Promise<Pokemon | null> {
    try {
      return await Pokemon.findOne({
        where: {
          name: {
            [Op.iLike]: name,
          },
        },
      });
    } catch (error: any) {
      logger.error(`Error in PokemonRepository.findByName: ${error.message}`);
      throw error;
    }
  }

  async findByNames(names: string[]): Promise<Pokemon[]> {
    try {
      return await Pokemon.findAll({
        where: {
          name: {
            [Op.in]: names,
          },
        },
      });
    } catch (error: any) {
      logger.error(`Error in PokemonRepository.findByNames: ${error.message}`);
      throw error;
    }
  }

  async bulkCreate(pokemons: any[]): Promise<Pokemon[]> {
    try {
      return await Pokemon.bulkCreate(pokemons, {
        updateOnDuplicate: [
          "name",
          "generation",
          "hp",
          "attack",
          "defense",
          "specialAttack",
          "specialDefense",
          "speed",
          "height",
          "weight",
          "types",
          "abilities",
          "searchText",
        ],
      });
    } catch (error: any) {
      logger.error(`Error in PokemonRepository.bulkCreate: ${error.message}`);
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      return await Pokemon.count();
    } catch (error: any) {
      logger.error(`Error in PokemonRepository.count: ${error.message}`);
      throw error;
    }
  }

  async findWithVectorSearch(
    query: string,
    options: {
      limit?: number;
      threshold?: number;
      hybridSearch?: boolean;
      filters?: PokemonFilters;
    } = {}
  ): Promise<{
    pokemons: Pokemon[];
    totalCount: number;
    searchMetadata: {
      usedVectorSearch: boolean;
      averageSimilarity: number;
      searchType: string;
    };
  }> {
    try {
      const {
        limit = 20,
        threshold = 0.7,
        hybridSearch = true,
        filters = {},
      } = options;

      logger.info(`Performing vector search for query: "${query}"`);

      // Perform vector search
      const vectorResults = hybridSearch
        ? await this.vectorSearchService.hybridSearch(query, {
            limit: limit * 2, // Get more results to allow for filtering
            threshold,
            searchTypes: ["combined", "name", "type"],
          })
        : await this.vectorSearchService.semanticSearch(query, {
            limit: limit * 2,
            threshold,
            searchTypes: ["combined"],
          });

      if (vectorResults.length === 0) {
        return {
          pokemons: [],
          totalCount: 0,
          searchMetadata: {
            usedVectorSearch: true,
            averageSimilarity: 0,
            searchType: hybridSearch ? "hybrid" : "vector",
          },
        };
      }

      // Apply additional filters if provided
      let filteredResults = vectorResults.map((result) => ({
        ...result,
        searchType: result.searchType as
          | "name"
          | "type"
          | "description"
          | "combined",
      }));

      if (Object.keys(filters).length > 0) {
        filteredResults = await this.applyFiltersToVectorResults(
          filteredResults,
          filters
        );
      }

      // Limit results
      const finalResults = filteredResults.slice(0, limit);

      // Calculate metadata
      const averageSimilarity =
        finalResults.length > 0
          ? finalResults.reduce((sum, result) => sum + result.similarity, 0) /
            finalResults.length
          : 0;

      const searchMetadata = {
        usedVectorSearch: true,
        averageSimilarity: Math.round(averageSimilarity * 1000) / 1000,
        searchType: hybridSearch ? "hybrid" : "vector",
      };

      logger.info(
        `Vector search returned ${finalResults.length} results with average similarity ${searchMetadata.averageSimilarity}`
      );

      return {
        pokemons: finalResults.map((result) => result.pokemon),
        totalCount: finalResults.length,
        searchMetadata,
      };
    } catch (error: any) {
      logger.error(`Error in vector search: ${error.message}`);
      // Fallback to regular search if vector search fails
      logger.info("Falling back to regular search due to vector search error");

      const fallbackResult = await this.findAll(
        { search: query, ...options.filters },
        1,
        options.limit || 20,
        "pokemonId",
        "ASC"
      );

      return {
        pokemons: fallbackResult.pokemons,
        totalCount: fallbackResult.totalCount,
        searchMetadata: {
          usedVectorSearch: false,
          averageSimilarity: 0,
          searchType: "fallback",
        },
      };
    }
  }

  /**
   * Apply traditional filters to vector search results
   */
  private async applyFiltersToVectorResults(
    vectorResults: Array<{
      pokemon: Pokemon;
      similarity: number;
      searchType: "name" | "type" | "description" | "combined";
    }>,
    filters: PokemonFilters
  ): Promise<
    Array<{
      pokemon: Pokemon;
      similarity: number;
      searchType: "name" | "type" | "description" | "combined";
    }>
  > {
    return vectorResults.filter((result) => {
      const pokemon = result.pokemon;

      // Type filter
      if (filters.types && filters.types.length > 0) {
        const hasMatchingType = filters.types.some((type) =>
          pokemon.types.includes(type)
        );
        if (!hasMatchingType) return false;
      }

      if (filters.type) {
        const filterTypes = filters.type.split(",").map((t) => t.trim());
        const hasMatchingType = filterTypes.some((type) =>
          pokemon.types.includes(type)
        );
        if (!hasMatchingType) return false;
      }

      // Generation filter
      if (filters.generation) {
        const filterGenerations = filters.generation
          .split(",")
          .map((g) => parseInt(g.trim(), 10))
          .filter((g) => !isNaN(g));
        if (
          filterGenerations.length > 0 &&
          !filterGenerations.includes(pokemon.generation)
        ) {
          return false;
        }
      }

      // Stat filters
      if (filters.minHp !== undefined && pokemon.hp < filters.minHp)
        return false;
      if (filters.minAttack !== undefined && pokemon.attack < filters.minAttack)
        return false;
      if (
        filters.minDefense !== undefined &&
        pokemon.defense < filters.minDefense
      )
        return false;
      if (
        filters.maxDefense !== undefined &&
        pokemon.defense > filters.maxDefense
      )
        return false;
      if (filters.minSpeed !== undefined && pokemon.speed < filters.minSpeed)
        return false;

      return true;
    });
  }

  async findWithTieredSearch(
    primaryFilters: PokemonFilters,
    fallbackFilters: PokemonFilters,
    page: number,
    limit: number,
    sortField: SortField,
    sortOrder: SortOrder
  ): Promise<{
    pokemons: Pokemon[];
    totalCount: number;
    usedFallback: boolean;
  }> {
    try {
      logger.info(
        `Attempting tiered search with primary filters: ${JSON.stringify(
          primaryFilters
        )} and fallback filters: ${JSON.stringify(fallbackFilters)}`
      );

      // Try primary search first
      const primaryResult = await this.findAll(
        primaryFilters,
        page,
        limit,
        sortField,
        sortOrder
      );

      // If we got results, return them
      if (primaryResult.pokemons.length > 0) {
        logger.info(
          `Primary search returned ${primaryResult.pokemons.length} results`
        );
        return {
          ...primaryResult,
          usedFallback: false,
        };
      }

      // If no results and we have fallback filters, try fallback search
      if (Object.keys(fallbackFilters).length > 0) {
        logger.info(
          "Primary search returned no results, trying fallback search"
        );
        const fallbackResult = await this.findAll(
          fallbackFilters,
          page,
          limit,
          sortField,
          sortOrder
        );

        if (fallbackResult.pokemons.length > 0) {
          logger.info(
            `Fallback search returned ${fallbackResult.pokemons.length} results`
          );
          return {
            ...fallbackResult,
            usedFallback: true,
          };
        }
      }

      // No results from either search
      logger.info("Both primary and fallback searches returned no results");
      return {
        pokemons: [],
        totalCount: 0,
        usedFallback: false,
      };
    } catch (error: any) {
      logger.error(
        `Error in PokemonRepository.findWithTieredSearch: ${error.message}`
      );
      throw error;
    }
  }
}
