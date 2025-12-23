import { SemanticSearchService } from "../services/semantic.service";

// Test the semantic search functionality
async function testSemanticSearch() {
  const semanticService = new SemanticSearchService();

  console.log("=== Testing Semantic Search ===\n");

  // Test cases
  const testQueries = [
    "flame type",
    "aqua pokemon",
    "fast pokemon",
    "tank pokemon",
    "glass cannon",
    "lightning bolt",
    "fire dragon",
    "water ice",
    "strong pokemon",
    "pikachu", // Regular text search
  ];

  for (const query of testQueries) {
    console.log(`\n--- Testing: "${query}" ---`);

    const analysis = semanticService.parseSemanticQuery(query);
    const filters = semanticService.generateSemanticFilters(analysis);

    console.log("Analysis:", {
      tokens: analysis.tokens,
      semanticMatches: analysis.semanticMatches.map((m) => ({
        term: m.term,
        confidence: m.confidence.toFixed(2),
        types: m.mapping.types,
        characteristics: m.mapping.characteristics,
      })),
      inferredTypes: analysis.inferredTypes,
      inferredCharacteristics: analysis.inferredCharacteristics,
    });

    console.log("Generated Filters:", filters);
  }

  console.log("\n=== Test Complete ===");
}

// Run the test
testSemanticSearch().catch(console.error);
