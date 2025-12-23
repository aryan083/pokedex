import { PokemonService } from "../services/pokemon.service";
import { PokemonRepositoryImpl } from "../repositories/pokemon.repository";
import { SearchService } from "../services/search.service";
import { RedisCache } from "../cache/redisCache";
import { sequelize } from "../config/database";

// Mock Redis cache for testing
class MockRedisCache extends RedisCache {
  private cache = new Map<string, any>();

  constructor() {
    super({} as any); // Mock Redis client
  }

  async get(key: string): Promise<any> {
    return this.cache.get(key) || null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.cache.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.has(key);
  }
}

async function testApiSemanticSearch() {
  try {
    console.log("=== Testing API Semantic Search ===\n");

    // Initialize services
    const mockCache = new MockRedisCache();
    const repository = new PokemonRepositoryImpl();
    const searchService = new SearchService(mockCache);
    const pokemonService = new PokemonService(
      repository,
      searchService,
      mockCache
    );

    // Test cases that should demonstrate the semantic search improvements
    const testCases = [
      {
        query: "flame type",
        description:
          "Should return Fire-type Pokémon (semantic mapping: flame → fire)",
      },
      {
        query: "aqua pokemon",
        description:
          "Should return Water-type Pokémon (semantic mapping: aqua → water)",
      },
      {
        query: "fast",
        description: "Should return fast Pokémon (speed > 100)",
      },
      {
        query: "tank",
        description: "Should return tanky Pokémon (high HP + Defense)",
      },
      {
        query: "glass",
        description:
          "Should return glass cannon Pokémon (high attack, low defense)",
      },
      {
        query: "lightning bolt",
        description: "Should return Electric-type Pokémon",
      },
      {
        query: "pikachu",
        description: "Should return Pikachu (regular text search)",
      },
    ];

    for (const testCase of testCases) {
      console.log(`\n--- Testing: "${testCase.query}" ---`);
      console.log(`Expected: ${testCase.description}`);

      try {
        const result = await pokemonService.searchPokemons({
          search: testCase.query,
          limit: 5,
          page: 1,
        });

        console.log(`Results: ${result.data?.length || 0} Pokémon found`);

        if (result.data && result.data.length > 0) {
          console.log("Sample results:");
          result.data.slice(0, 3).forEach((pokemon: any) => {
            console.log(
              `  - ${pokemon.name} (${pokemon.types.join("/")}) - HP:${
                pokemon.hp
              } ATK:${pokemon.attack} DEF:${pokemon.defense} SPD:${
                pokemon.speed
              }`
            );
          });
        }

        if (result.meta?.usedSemanticFallback) {
          console.log("✓ Used semantic fallback search");
        }
      } catch (error: any) {
        console.log(`Error: ${error.message}`);
      }
    }

    console.log("\n=== API Test Complete ===");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
}

// Run the test
testApiSemanticSearch().catch(console.error);
