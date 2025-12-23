import { sequelize } from "../config/database";
import { Pokemon } from "../models";
import { EmbeddingService } from "../services/embedding.service";
import { VectorSearchService } from "../services/vector-search.service";
import { logger } from "../middlewares/requestLogger.middleware";
import { Op } from "sequelize";

/**
 * Production script to generate vector embeddings for all Pokemon
 * This should be run after seeding the database with Pokemon data
 */
async function generateAllEmbeddings() {
  try {
    console.log("🚀 Starting Pokemon embedding generation...\n");

    // Initialize services
    const embeddingService = new EmbeddingService();
    const vectorSearchService = new VectorSearchService(embeddingService);

    // Check current status
    const stats = await vectorSearchService.getVectorSearchStats();
    console.log("📊 Current Status:");
    console.log(`   Total Pokemon: ${stats.totalPokemon}`);
    console.log(`   Pokemon with embeddings: ${stats.pokemonWithEmbeddings}`);
    console.log(`   Coverage: ${stats.embeddingCoverage}%\n`);

    if (stats.embeddingCoverage >= 100) {
      console.log("✅ All Pokemon already have embeddings generated!");
      return;
    }

    // Generate embeddings in batches
    console.log("🔄 Starting batch embedding generation...");
    const result = await vectorSearchService.batchGenerateEmbeddings(
      undefined, // Generate for all Pokemon without embeddings
      5 // Batch size - smaller to respect API limits
    );

    console.log("\n📈 Generation Results:");
    console.log(`   ✅ Success: ${result.success}`);
    console.log(`   ❌ Failed: ${result.failed}`);

    if (result.errors.length > 0) {
      console.log("\n❌ Errors:");
      result.errors.slice(0, 10).forEach((error) => {
        console.log(`   - ${error}`);
      });
      if (result.errors.length > 10) {
        console.log(`   ... and ${result.errors.length - 10} more errors`);
      }
    }

    // Final stats
    const finalStats = await vectorSearchService.getVectorSearchStats();
    console.log("\n📊 Final Status:");
    console.log(`   Total Pokemon: ${finalStats.totalPokemon}`);
    console.log(
      `   Pokemon with embeddings: ${finalStats.pokemonWithEmbeddings}`
    );
    console.log(`   Coverage: ${finalStats.embeddingCoverage}%`);

    if (finalStats.embeddingCoverage >= 95) {
      console.log("\n🎉 Embedding generation completed successfully!");
      console.log("🔍 Vector search is now ready for production use.");
    } else {
      console.log(
        "\n⚠️  Some embeddings failed to generate. Check the errors above."
      );
    }
  } catch (error: any) {
    console.error("💥 Embedding generation failed:", error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

/**
 * Generate embeddings for specific Pokemon (useful for testing)
 */
async function generateTestEmbeddings() {
  try {
    console.log("🧪 Generating test embeddings for popular Pokemon...\n");

    const embeddingService = new EmbeddingService();
    const vectorSearchService = new VectorSearchService(embeddingService);

    // Test with popular Pokemon
    const testPokemonNames = [
      "pikachu",
      "charizard",
      "blastoise",
      "venusaur",
      "mewtwo",
    ];

    for (const name of testPokemonNames) {
      const pokemon = await Pokemon.findOne({
        where: { name: { [Op.iLike]: name } },
      });

      if (pokemon) {
        console.log(`Generating embeddings for ${pokemon.name}...`);
        await vectorSearchService.generateAndStorePokemonEmbeddings(pokemon);
        console.log(`✅ ${pokemon.name} embeddings generated`);
      } else {
        console.log(`❌ ${name} not found in database`);
      }
    }

    console.log("\n🎉 Test embeddings generated successfully!");
  } catch (error: any) {
    console.error("💥 Test embedding generation failed:", error.message);
  } finally {
    await sequelize.close();
  }
}

// Command line interface
const command = process.argv[2];

if (command === "test") {
  generateTestEmbeddings();
} else if (command === "all" || !command) {
  generateAllEmbeddings();
} else {
  console.log("Usage:");
  console.log("  npm run generate-embeddings        # Generate all embeddings");
  console.log(
    "  npm run generate-embeddings test   # Generate test embeddings"
  );
  process.exit(1);
}
