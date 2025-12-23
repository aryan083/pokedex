import { HfInference } from "@huggingface/inference";
import { logger } from "../middlewares/requestLogger.middleware";

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  dimensions: number;
}

export interface PokemonEmbeddings {
  nameEmbedding: number[];
  typeEmbedding: number[];
  descriptionEmbedding: number[];
  combinedEmbedding: number[];
}

/**
 * Production-grade embedding service using Hugging Face Transformers
 * Uses sentence-transformers/all-MiniLM-L6-v2 for high-quality 384-dimensional embeddings
 */
export class EmbeddingService {
  private hf: HfInference;
  private readonly MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2";
  private readonly EMBEDDING_DIMENSIONS = 384;
  private readonly BATCH_SIZE = 32;
  private readonly enabled: boolean;

  // Cache for frequently used embeddings
  private embeddingCache = new Map<string, number[]>();
  private readonly CACHE_MAX_SIZE = 1000;

  constructor() {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    this.enabled = Boolean(apiKey);

    if (!apiKey) {
      this.hf = new HfInference('');
      logger.warn('EmbeddingService disabled (missing HUGGINGFACE_API_KEY)');
      return;
    }

    this.hf = new HfInference(apiKey);
    logger.info(`EmbeddingService initialized with model: ${this.MODEL_NAME}`);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    try {
      if (!this.enabled) {
        throw new Error('Embedding service is disabled');
      }

      // Check cache first
      const cacheKey = `${this.MODEL_NAME}:${text}`;
      if (this.embeddingCache.has(cacheKey)) {
        return {
          embedding: this.embeddingCache.get(cacheKey)!,
          model: this.MODEL_NAME,
          dimensions: this.EMBEDDING_DIMENSIONS,
        };
      }

      // Clean and normalize text
      const cleanText = this.preprocessText(text);

      // Generate embedding using Hugging Face
      const response = await this.hf.featureExtraction({
        model: this.MODEL_NAME,
        inputs: cleanText,
      });

      // Handle different response formats
      let embedding: number[];
      if (Array.isArray(response) && Array.isArray(response[0])) {
        // 2D array - take first row
        embedding = response[0] as number[];
      } else if (Array.isArray(response)) {
        // 1D array
        embedding = response as number[];
      } else {
        throw new Error("Unexpected embedding response format");
      }

      // Validate embedding dimensions
      if (embedding.length !== this.EMBEDDING_DIMENSIONS) {
        throw new Error(
          `Expected ${this.EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`
        );
      }

      // Normalize embedding (L2 normalization for cosine similarity)
      const normalizedEmbedding = this.normalizeVector(embedding);

      // Cache the result
      this.cacheEmbedding(cacheKey, normalizedEmbedding);

      return {
        embedding: normalizedEmbedding,
        model: this.MODEL_NAME,
        dimensions: this.EMBEDDING_DIMENSIONS,
      };
    } catch (error: any) {
      logger.error(
        `Error generating embedding for text "${text}": ${error.message}`
      );
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];

    // Process in batches to avoid API limits
    for (let i = 0; i < texts.length; i += this.BATCH_SIZE) {
      const batch = texts.slice(i, i + this.BATCH_SIZE);
      const batchPromises = batch.map((text) => this.generateEmbedding(text));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add small delay between batches to respect rate limits
      if (i + this.BATCH_SIZE < texts.length) {
        await this.delay(100);
      }
    }

    return results;
  }

  /**
   * Generate comprehensive embeddings for a Pokemon
   */
  async generatePokemonEmbeddings(pokemon: {
    name: string;
    types: string[];
    abilities: string[];
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    generation: number;
  }): Promise<PokemonEmbeddings> {
    try {
      // Create semantic descriptions for different aspects
      const nameText = pokemon.name;

      const typeText = `${pokemon.types.join(" ")} type pokemon`;

      const descriptionText = this.createPokemonDescription(pokemon);

      const combinedText = `${pokemon.name} is a ${pokemon.types.join(
        " and "
      )} type pokemon from generation ${pokemon.generation} with ${
        pokemon.hp
      } HP, ${pokemon.attack} attack, ${pokemon.defense} defense, and ${
        pokemon.speed
      } speed. Abilities: ${pokemon.abilities.join(", ")}.`;

      // Generate embeddings for each aspect
      const [nameResult, typeResult, descriptionResult, combinedResult] =
        await Promise.all([
          this.generateEmbedding(nameText),
          this.generateEmbedding(typeText),
          this.generateEmbedding(descriptionText),
          this.generateEmbedding(combinedText),
        ]);

      return {
        nameEmbedding: nameResult.embedding,
        typeEmbedding: typeResult.embedding,
        descriptionEmbedding: descriptionResult.embedding,
        combinedEmbedding: combinedResult.embedding,
      };
    } catch (error: any) {
      logger.error(
        `Error generating Pokemon embeddings for ${pokemon.name}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error("Vectors must have the same dimensions");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Find most similar embeddings using approximate nearest neighbor search
   */
  async findSimilarEmbeddings(
    queryEmbedding: number[],
    candidateEmbeddings: Array<{
      id: string;
      embedding: number[];
      metadata?: any;
    }>,
    topK: number = 10,
    threshold: number = 0.7
  ): Promise<Array<{ id: string; similarity: number; metadata?: any }>> {
    const similarities = candidateEmbeddings.map((candidate) => ({
      id: candidate.id,
      similarity: this.calculateCosineSimilarity(
        queryEmbedding,
        candidate.embedding
      ),
      metadata: candidate.metadata,
    }));

    return similarities
      .filter((item) => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Create semantic description for Pokemon characteristics
   */
  private createPokemonDescription(pokemon: {
    types: string[];
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    abilities: string[];
  }): string {
    const characteristics = [];

    // Stat-based characteristics
    if (pokemon.speed > 100) characteristics.push("fast", "quick", "speedy");
    if (pokemon.hp + pokemon.defense > 160)
      characteristics.push("tank", "bulky", "defensive");
    if (pokemon.attack > 100 && pokemon.defense < 70)
      characteristics.push("glass cannon", "fragile", "offensive");
    if (pokemon.attack > 120)
      characteristics.push("strong", "powerful", "mighty");
    if (pokemon.hp > 100) characteristics.push("tough", "resilient", "hardy");
    if (pokemon.defense > 100)
      characteristics.push("defensive", "sturdy", "protective");

    // Type-based characteristics
    const typeCharacteristics = this.getTypeCharacteristics(pokemon.types);
    characteristics.push(...typeCharacteristics);

    // Ability-based characteristics
    const abilityCharacteristics = this.getAbilityCharacteristics(
      pokemon.abilities
    );
    characteristics.push(...abilityCharacteristics);

    return characteristics.join(" ");
  }

  /**
   * Get semantic characteristics for Pokemon types
   */
  private getTypeCharacteristics(types: string[]): string[] {
    const typeMap: Record<string, string[]> = {
      fire: ["flame", "burn", "heat", "hot", "blazing", "scorching"],
      water: ["aqua", "ocean", "sea", "marine", "splash", "wave", "fluid"],
      electric: [
        "bolt",
        "lightning",
        "thunder",
        "shock",
        "spark",
        "zap",
        "voltage",
      ],
      grass: [
        "leaf",
        "plant",
        "nature",
        "forest",
        "bloom",
        "green",
        "photosynthesis",
      ],
      ice: ["frost", "freeze", "cold", "snow", "blizzard", "frozen", "arctic"],
      ground: [
        "earth",
        "soil",
        "dirt",
        "sand",
        "mud",
        "terrestrial",
        "seismic",
      ],
      flying: ["wind", "air", "sky", "wing", "feather", "aerial", "soaring"],
      psychic: [
        "mind",
        "mental",
        "brain",
        "telekinesis",
        "telepathy",
        "psychokinesis",
      ],
      bug: ["insect", "beetle", "spider", "ant", "swarm", "chitinous"],
      rock: ["stone", "mineral", "crystal", "gem", "boulder", "geological"],
      ghost: ["spirit", "phantom", "spook", "haunt", "ethereal", "spectral"],
      dragon: ["wyrm", "drake", "serpent", "legendary", "mythical", "ancient"],
      dark: ["shadow", "evil", "night", "sinister", "malevolent", "obscure"],
      steel: [
        "metal",
        "iron",
        "chrome",
        "metallic",
        "mechanical",
        "industrial",
      ],
      fairy: [
        "magic",
        "mystical",
        "enchanted",
        "whimsical",
        "magical",
        "ethereal",
      ],
      poison: ["toxic", "venom", "acid", "poisonous", "venomous", "noxious"],
      fighting: ["martial", "combat", "warrior", "brawl", "battle", "physical"],
      normal: ["ordinary", "common", "regular", "standard", "typical", "basic"],
    };

    const characteristics: string[] = [];
    types.forEach((type) => {
      if (typeMap[type]) {
        characteristics.push(...typeMap[type]);
      }
    });

    return characteristics;
  }

  /**
   * Get semantic characteristics for Pokemon abilities
   */
  private getAbilityCharacteristics(abilities: string[]): string[] {
    // This could be expanded with a comprehensive ability-to-characteristic mapping
    return abilities.map((ability) =>
      ability.toLowerCase().replace(/[^a-z0-9]/g, " ")
    );
  }

  /**
   * Preprocess text for embedding generation
   */
  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ");
  }

  /**
   * Normalize vector using L2 normalization
   */
  private normalizeVector(vector: number[]): number[] {
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return norm === 0 ? vector : vector.map((val) => val / norm);
  }

  /**
   * Cache embedding with LRU eviction
   */
  private cacheEmbedding(key: string, embedding: number[]): void {
    if (this.embeddingCache.size >= this.CACHE_MAX_SIZE) {
      // Remove oldest entry (simple LRU)
      const firstKey = this.embeddingCache.keys().next().value;
      if (firstKey) {
        this.embeddingCache.delete(firstKey);
      }
    }
    this.embeddingCache.set(key, embedding);
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get embedding cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.embeddingCache.size,
      maxSize: this.CACHE_MAX_SIZE,
    };
  }

  /**
   * Clear embedding cache
   */
  clearCache(): void {
    this.embeddingCache.clear();
    logger.info("Embedding cache cleared");
  }
}
