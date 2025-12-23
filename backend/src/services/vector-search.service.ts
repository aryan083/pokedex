import { Op, QueryTypes } from "sequelize";
import { Pokemon } from "../models";
import { sequelize } from "../config/database";
import { EmbeddingService } from "./embedding.service";
import { logger } from "../middlewares/requestLogger.middleware";

export interface VectorSearchResult {
  pokemon: Pokemon;
  similarity: number;
  searchType: "name" | "type" | "description" | "combined";
  hybridScore?: number;
}

export interface VectorSearchOptions {
  limit?: number;
  threshold?: number;
  searchTypes?: Array<"name" | "type" | "description" | "combined">;
  hybridWeight?: {
    vector: number;
    text: number;
  };
  includeTextSearch?: boolean;
  textQuery?: string;
}

/**
 * Production-grade vector search service using PostgreSQL pgvector
 * Implements hybrid search combining vector similarity with traditional text search
 */
export class VectorSearchService {
  private embeddingService: EmbeddingService;
  private readonly DEFAULT_LIMIT = 20;
  private readonly DEFAULT_THRESHOLD = 0.7;
  private readonly DEFAULT_HYBRID_WEIGHTS = { vector: 0.7, text: 0.3 };

  constructor(embeddingService: EmbeddingService) {
    this.embeddingService = embeddingService;
  }

  /**
   * Perform semantic vector search across Pokemon database
   */
  async semanticSearch(
    query: string,
    options: VectorSearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    try {
      const {
        limit = this.DEFAULT_LIMIT,
        threshold = this.DEFAULT_THRESHOLD,
        searchTypes = ["combined"],
        hybridWeight = this.DEFAULT_HYBRID_WEIGHTS,
        includeTextSearch = true,
        textQuery = query,
      } = options;

      logger.info(`Performing vector search for query: "${query}"`);

      // Generate query embedding
      const queryEmbedding = await this.embeddingService.generateEmbedding(
        query
      );
      const embeddingVector = `[${queryEmbedding.embedding.join(",")}]`;

      const results: VectorSearchResult[] = [];

      // Search across different embedding types
      for (const searchType of searchTypes) {
        const searchResults = await this.performVectorSearch(
          embeddingVector,
          searchType,
          limit,
          threshold,
          includeTextSearch ? textQuery : undefined,
          hybridWeight
        );
        results.push(...searchResults);
      }

      // Deduplicate and sort by best score
      const deduplicatedResults = this.deduplicateResults(results);
      const sortedResults = deduplicatedResults
        .sort(
          (a, b) =>
            (b.hybridScore || b.similarity) - (a.hybridScore || a.similarity)
        )
        .slice(0, limit);

      logger.info(`Vector search returned ${sortedResults.length} results`);
      return sortedResults;
    } catch (error: any) {
      logger.error(`Error in vector search: ${error.message}`);
      throw new Error(`Vector search failed: ${error.message}`);
    }
  }

  /**
   * Perform hybrid search combining vector similarity with text search
   */
  async hybridSearch(
    query: string,
    options: VectorSearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    const hybridOptions = {
      ...options,
      includeTextSearch: true,
      searchTypes: options.searchTypes || ["combined", "name", "type"],
      hybridWeight: options.hybridWeight || this.DEFAULT_HYBRID_WEIGHTS,
    };

    return this.semanticSearch(query, hybridOptions);
  }

  /**
   * Find similar Pokemon based on another Pokemon's characteristics
   */
  async findSimilarPokemon(
    pokemonId: number,
    options: VectorSearchOptions = {}
  ): Promise<VectorSearchResult[]> {
    try {
      const pokemon = await Pokemon.findByPk(pokemonId);
      if (!pokemon) {
        throw new Error(`Pokemon with ID ${pokemonId} not found`);
      }

      if (!pokemon.combinedEmbedding) {
        throw new Error(
          `Pokemon ${pokemon.name} does not have embeddings generated`
        );
      }

      const embeddingVector = `[${pokemon.combinedEmbedding.join(",")}]`;

      const results = await this.performVectorSearch(
        embeddingVector,
        "combined",
        options.limit || this.DEFAULT_LIMIT,
        options.threshold || this.DEFAULT_THRESHOLD
      );

      // Filter out the original Pokemon
      return results.filter((result) => result.pokemon.pokemonId !== pokemonId);
    } catch (error: any) {
      logger.error(`Error finding similar Pokemon: ${error.message}`);
      throw error;
    }
  }

  /**
   * Perform the actual vector search query against PostgreSQL
   */
  private async performVectorSearch(
    embeddingVector: string,
    searchType: "name" | "type" | "description" | "combined",
    limit: number,
    threshold: number,
    textQuery?: string,
    hybridWeight?: { vector: number; text: number }
  ): Promise<VectorSearchResult[]> {
    const embeddingColumn = `${searchType}Embedding`;

    let query: string;
    let replacements: any = {
      embedding: embeddingVector,
      threshold,
      limit,
    };

    if (textQuery && hybridWeight) {
      // Hybrid search query
      query = `
        SELECT 
          p.*,
          (1 - (p."${embeddingColumn}" <=> $embedding::vector)) as vector_similarity,
          CASE 
            WHEN p.name ILIKE $textQuery THEN 1.0
            ELSE similarity(p.name, $textQueryClean)
          END as text_similarity,
          calculate_hybrid_score(
            (1 - (p."${embeddingColumn}" <=> $embedding::vector)),
            CASE 
              WHEN p.name ILIKE $textQuery THEN 1.0
              ELSE similarity(p.name, $textQueryClean)
            END,
            $vectorWeight,
            $textWeight
          ) as hybrid_score
        FROM pokemons p
        WHERE p."${embeddingColumn}" IS NOT NULL
          AND (1 - (p."${embeddingColumn}" <=> $embedding::vector)) >= $threshold
        ORDER BY hybrid_score DESC
        LIMIT $limit;
      `;

      replacements = {
        ...replacements,
        textQuery: `%${textQuery}%`,
        textQueryClean: textQuery,
        vectorWeight: hybridWeight.vector,
        textWeight: hybridWeight.text,
      };
    } else {
      // Pure vector search query
      query = `
        SELECT 
          p.*,
          (1 - (p."${embeddingColumn}" <=> $embedding::vector)) as vector_similarity
        FROM pokemons p
        WHERE p."${embeddingColumn}" IS NOT NULL
          AND (1 - (p."${embeddingColumn}" <=> $embedding::vector)) >= $threshold
        ORDER BY p."${embeddingColumn}" <=> $embedding::vector
        LIMIT $limit;
      `;
    }

    const rawResults = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      bind: replacements,
    });

    return rawResults.map((row: any) => ({
      pokemon: this.mapRowToPokemon(row),
      similarity: row.vector_similarity,
      searchType,
      hybridScore: row.hybrid_score,
    }));
  }

  /**
   * Generate and store embeddings for a Pokemon
   */
  async generateAndStorePokemonEmbeddings(pokemon: Pokemon): Promise<void> {
    try {
      logger.info(`Generating embeddings for Pokemon: ${pokemon.name}`);

      const embeddings = await this.embeddingService.generatePokemonEmbeddings({
        name: pokemon.name,
        types: pokemon.types,
        abilities: pokemon.abilities,
        hp: pokemon.hp,
        attack: pokemon.attack,
        defense: pokemon.defense,
        speed: pokemon.speed,
        generation: pokemon.generation,
      });

      // Update Pokemon with embeddings
      await pokemon.update({
        nameEmbedding: embeddings.nameEmbedding,
        typeEmbedding: embeddings.typeEmbedding,
        descriptionEmbedding: embeddings.descriptionEmbedding,
        combinedEmbedding: embeddings.combinedEmbedding,
      });

      logger.info(`Successfully generated embeddings for ${pokemon.name}`);
    } catch (error: any) {
      logger.error(
        `Failed to generate embeddings for ${pokemon.name}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Batch generate embeddings for multiple Pokemon
   */
  async batchGenerateEmbeddings(
    pokemonIds?: number[],
    batchSize: number = 10
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    try {
      let pokemon: Pokemon[];

      if (pokemonIds) {
        pokemon = await Pokemon.findAll({
          where: { pokemonId: { [Op.in]: pokemonIds } },
        });
      } else {
        // Generate for all Pokemon without embeddings
        const pokemonWithoutEmbeddings = await sequelize.query(
          `
          SELECT * FROM pokemons 
          WHERE "combinedEmbedding" IS NULL 
             OR "nameEmbedding" IS NULL 
             OR "typeEmbedding" IS NULL 
             OR "descriptionEmbedding" IS NULL
        `,
          {
            type: QueryTypes.SELECT,
            model: Pokemon,
            mapToModel: true,
          }
        );

        pokemon = pokemonWithoutEmbeddings as Pokemon[];
      }

      logger.info(
        `Starting batch embedding generation for ${pokemon.length} Pokemon`
      );

      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      // Process in batches to avoid overwhelming the API
      for (let i = 0; i < pokemon.length; i += batchSize) {
        const batch = pokemon.slice(i, i + batchSize);

        const batchPromises = batch.map(async (p) => {
          try {
            await this.generateAndStorePokemonEmbeddings(p);
            return { success: true, pokemon: p.name };
          } catch (error: any) {
            return { success: false, pokemon: p.name, error: error.message };
          }
        });

        const batchResults = await Promise.all(batchPromises);

        batchResults.forEach((result) => {
          if (result.success) {
            success++;
          } else {
            failed++;
            errors.push(`${result.pokemon}: ${result.error}`);
          }
        });

        // Add delay between batches to respect rate limits
        if (i + batchSize < pokemon.length) {
          await this.delay(1000);
        }

        logger.info(
          `Batch ${
            Math.floor(i / batchSize) + 1
          } completed. Success: ${success}, Failed: ${failed}`
        );
      }

      logger.info(
        `Batch embedding generation completed. Success: ${success}, Failed: ${failed}`
      );
      return { success, failed, errors };
    } catch (error: any) {
      logger.error(`Batch embedding generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get vector search statistics
   */
  async getVectorSearchStats(): Promise<{
    totalPokemon: number;
    pokemonWithEmbeddings: number;
    embeddingCoverage: number;
    indexStats: any;
  }> {
    try {
      const totalPokemon = await Pokemon.count();

      const pokemonWithEmbeddingsCount = await sequelize.query(
        `
        SELECT COUNT(*) as count FROM pokemons WHERE "combinedEmbedding" IS NOT NULL
      `,
        {
          type: QueryTypes.SELECT,
        }
      );

      const pokemonWithEmbeddings = parseInt(
        (pokemonWithEmbeddingsCount[0] as any).count,
        10
      );

      const embeddingCoverage =
        totalPokemon > 0 ? (pokemonWithEmbeddings / totalPokemon) * 100 : 0;

      // Get index statistics
      const indexStats = await sequelize.query(
        `
        SELECT 
          schemaname,
          tablename,
          indexname,
          pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
        FROM pg_indexes 
        WHERE tablename = 'pokemons' 
          AND indexname LIKE '%embedding%';
      `,
        { type: QueryTypes.SELECT }
      );

      return {
        totalPokemon,
        pokemonWithEmbeddings,
        embeddingCoverage: Math.round(embeddingCoverage * 100) / 100,
        indexStats,
      };
    } catch (error: any) {
      logger.error(`Error getting vector search stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deduplicate search results by Pokemon ID, keeping the best score
   */
  private deduplicateResults(
    results: VectorSearchResult[]
  ): VectorSearchResult[] {
    const resultMap = new Map<number, VectorSearchResult>();

    results.forEach((result) => {
      const pokemonId = result.pokemon.pokemonId;
      const existingResult = resultMap.get(pokemonId);

      if (!existingResult) {
        resultMap.set(pokemonId, result);
      } else {
        const currentScore = result.hybridScore || result.similarity;
        const existingScore =
          existingResult.hybridScore || existingResult.similarity;

        if (currentScore > existingScore) {
          resultMap.set(pokemonId, result);
        }
      }
    });

    return Array.from(resultMap.values());
  }

  /**
   * Map database row to Pokemon model
   */
  private mapRowToPokemon(row: any): Pokemon {
    const pokemon = new Pokemon();
    Object.assign(pokemon, row);
    return pokemon;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
