import { logger } from "../middlewares/requestLogger.middleware";

// Semantic mappings for Pokemon types and characteristics
export interface SemanticMapping {
  synonyms: string[];
  types?: string[];
  characteristics?: {
    minHp?: number;
    minAttack?: number;
    minDefense?: number;
    minSpeed?: number;
    maxDefense?: number;
  };
}

// Comprehensive semantic mappings
export const SEMANTIC_MAPPINGS: Record<string, SemanticMapping> = {
  // Direct type mappings (exact Pokemon types)
  fire: { synonyms: ["flame", "burn", "heat"], types: ["fire"] },
  water: { synonyms: ["aqua", "ocean", "sea"], types: ["water"] },
  electric: { synonyms: ["bolt", "lightning", "thunder"], types: ["electric"] },
  grass: { synonyms: ["leaf", "plant", "nature"], types: ["grass"] },
  ice: { synonyms: ["frost", "freeze", "cold"], types: ["ice"] },
  ground: { synonyms: ["earth", "soil", "dirt"], types: ["ground"] },
  flying: { synonyms: ["wind", "air", "sky"], types: ["flying"] },
  psychic: { synonyms: ["mind", "mental", "brain"], types: ["psychic"] },
  bug: { synonyms: ["insect", "beetle"], types: ["bug"] },
  rock: { synonyms: ["stone", "mineral"], types: ["rock"] },
  ghost: { synonyms: ["spirit", "phantom"], types: ["ghost"] },
  dragon: { synonyms: ["wyrm", "drake"], types: ["dragon"] },
  dark: { synonyms: ["shadow", "evil"], types: ["dark"] },
  steel: { synonyms: ["metal", "iron"], types: ["steel"] },
  fairy: { synonyms: ["magic", "mystical"], types: ["fairy"] },
  poison: { synonyms: ["toxic", "venom"], types: ["poison"] },
  fighting: { synonyms: ["martial", "combat"], types: ["fighting"] },
  normal: { synonyms: [], types: ["normal"] },

  // Type synonyms
  flame: { synonyms: ["fire", "burn", "heat"], types: ["fire"] },
  blaze: { synonyms: ["fire", "flame"], types: ["fire"] },
  inferno: { synonyms: ["fire", "flame"], types: ["fire"] },
  ember: { synonyms: ["fire", "flame"], types: ["fire"] },
  scorch: { synonyms: ["fire", "flame"], types: ["fire"] },

  aqua: { synonyms: ["water", "ocean", "sea"], types: ["water"] },
  hydro: { synonyms: ["water", "aqua"], types: ["water"] },
  marine: { synonyms: ["water", "ocean"], types: ["water"] },
  splash: { synonyms: ["water"], types: ["water"] },
  wave: { synonyms: ["water"], types: ["water"] },

  bolt: { synonyms: ["electric", "lightning", "thunder"], types: ["electric"] },
  shock: { synonyms: ["electric", "lightning"], types: ["electric"] },
  thunder: { synonyms: ["electric", "lightning"], types: ["electric"] },
  lightning: { synonyms: ["electric", "thunder"], types: ["electric"] },
  spark: { synonyms: ["electric"], types: ["electric"] },
  zap: { synonyms: ["electric"], types: ["electric"] },

  leaf: { synonyms: ["grass", "plant", "nature"], types: ["grass"] },
  plant: { synonyms: ["grass", "leaf"], types: ["grass"] },
  nature: { synonyms: ["grass", "plant"], types: ["grass"] },
  forest: { synonyms: ["grass", "plant"], types: ["grass"] },
  bloom: { synonyms: ["grass", "plant"], types: ["grass"] },

  frost: { synonyms: ["ice", "freeze", "cold"], types: ["ice"] },
  freeze: { synonyms: ["ice", "frost"], types: ["ice"] },
  cold: { synonyms: ["ice", "frost"], types: ["ice"] },
  snow: { synonyms: ["ice"], types: ["ice"] },
  blizzard: { synonyms: ["ice"], types: ["ice"] },

  earth: { synonyms: ["ground", "soil", "dirt"], types: ["ground"] },
  soil: { synonyms: ["ground", "earth"], types: ["ground"] },
  dirt: { synonyms: ["ground", "earth"], types: ["ground"] },
  sand: { synonyms: ["ground"], types: ["ground"] },
  mud: { synonyms: ["ground"], types: ["ground"] },

  wind: { synonyms: ["flying", "air", "sky"], types: ["flying"] },
  air: { synonyms: ["flying", "wind"], types: ["flying"] },
  sky: { synonyms: ["flying", "wind"], types: ["flying"] },
  wing: { synonyms: ["flying"], types: ["flying"] },
  feather: { synonyms: ["flying"], types: ["flying"] },

  mind: { synonyms: ["psychic", "mental", "brain"], types: ["psychic"] },
  mental: { synonyms: ["psychic", "mind"], types: ["psychic"] },
  brain: { synonyms: ["psychic", "mind"], types: ["psychic"] },
  telekinesis: { synonyms: ["psychic"], types: ["psychic"] },

  insect: { synonyms: ["bug", "beetle"], types: ["bug"] },
  beetle: { synonyms: ["bug", "insect"], types: ["bug"] },
  spider: { synonyms: ["bug"], types: ["bug"] },
  ant: { synonyms: ["bug"], types: ["bug"] },

  stone: { synonyms: ["rock", "mineral"], types: ["rock"] },
  mineral: { synonyms: ["rock", "stone"], types: ["rock"] },
  crystal: { synonyms: ["rock"], types: ["rock"] },
  gem: { synonyms: ["rock"], types: ["rock"] },

  spirit: { synonyms: ["ghost", "phantom"], types: ["ghost"] },
  phantom: { synonyms: ["ghost", "spirit"], types: ["ghost"] },
  spook: { synonyms: ["ghost"], types: ["ghost"] },
  haunt: { synonyms: ["ghost"], types: ["ghost"] },

  wyrm: { synonyms: ["dragon", "drake"], types: ["dragon"] },
  drake: { synonyms: ["dragon", "wyrm"], types: ["dragon"] },
  serpent: { synonyms: ["dragon"], types: ["dragon"] },

  shadow: { synonyms: ["dark", "evil"], types: ["dark"] },
  evil: { synonyms: ["dark", "shadow"], types: ["dark"] },
  night: { synonyms: ["dark"], types: ["dark"] },

  metal: { synonyms: ["steel", "iron"], types: ["steel"] },
  iron: { synonyms: ["steel", "metal"], types: ["steel"] },
  chrome: { synonyms: ["steel"], types: ["steel"] },

  magic: { synonyms: ["fairy", "mystical"], types: ["fairy"] },
  mystical: { synonyms: ["fairy", "magic"], types: ["fairy"] },
  enchanted: { synonyms: ["fairy"], types: ["fairy"] },

  toxic: { synonyms: ["poison", "venom"], types: ["poison"] },
  venom: { synonyms: ["poison", "toxic"], types: ["poison"] },
  acid: { synonyms: ["poison"], types: ["poison"] },

  martial: { synonyms: ["fighting", "combat"], types: ["fighting"] },
  combat: { synonyms: ["fighting", "martial"], types: ["fighting"] },
  warrior: { synonyms: ["fighting"], types: ["fighting"] },
  brawl: { synonyms: ["fighting"], types: ["fighting"] },

  // Characteristic-based terms
  fast: {
    synonyms: ["quick", "speedy", "swift"],
    characteristics: { minSpeed: 100 },
  },
  quick: {
    synonyms: ["fast", "speedy"],
    characteristics: { minSpeed: 90 },
  },
  speedy: {
    synonyms: ["fast", "quick"],
    characteristics: { minSpeed: 95 },
  },
  swift: {
    synonyms: ["fast", "quick"],
    characteristics: { minSpeed: 85 },
  },

  tank: {
    synonyms: ["tanky", "bulky", "defensive"],
    characteristics: { minHp: 80, minDefense: 80 },
  },
  tanky: {
    synonyms: ["tank", "bulky"],
    characteristics: { minHp: 75, minDefense: 75 },
  },
  bulky: {
    synonyms: ["tank", "tanky"],
    characteristics: { minHp: 85, minDefense: 70 },
  },
  defensive: {
    synonyms: ["tank", "bulky"],
    characteristics: { minDefense: 90 },
  },

  glass: {
    synonyms: ["fragile", "frail"],
    characteristics: { minAttack: 100, maxDefense: 70 },
  },
  fragile: {
    synonyms: ["glass", "frail"],
    characteristics: { maxDefense: 65 },
  },
  frail: {
    synonyms: ["glass", "fragile"],
    characteristics: { maxDefense: 60 },
  },

  strong: {
    synonyms: ["powerful", "mighty"],
    characteristics: { minAttack: 100 },
  },
  powerful: {
    synonyms: ["strong", "mighty"],
    characteristics: { minAttack: 110 },
  },
  mighty: {
    synonyms: ["strong", "powerful"],
    characteristics: { minAttack: 120 },
  },

  tough: {
    synonyms: ["hardy", "resilient"],
    characteristics: { minHp: 90 },
  },
  hardy: {
    synonyms: ["tough", "resilient"],
    characteristics: { minHp: 85, minDefense: 70 },
  },
  resilient: {
    synonyms: ["tough", "hardy"],
    characteristics: { minHp: 80, minDefense: 75 },
  },
};

// Simple vector similarity using word embeddings (simplified approach)
export class SemanticSearchService {
  private semanticMappings: Record<string, SemanticMapping>;

  constructor() {
    this.semanticMappings = SEMANTIC_MAPPINGS;
  }

  /**
   * Parse a search query and extract semantic intent
   */
  parseSemanticQuery(query: string): {
    originalQuery: string;
    tokens: string[];
    semanticMatches: Array<{
      term: string;
      mapping: SemanticMapping;
      confidence: number;
    }>;
    inferredTypes: string[];
    inferredCharacteristics: any;
  } {
    const originalQuery = query.toLowerCase().trim();
    const tokens = originalQuery.split(/\s+/).filter(Boolean);

    const semanticMatches: Array<{
      term: string;
      mapping: SemanticMapping;
      confidence: number;
    }> = [];

    const inferredTypes: string[] = [];
    const inferredCharacteristics: any = {};

    // Direct mapping check
    const processedMappings = new Set<SemanticMapping>();

    for (const token of tokens) {
      if (this.semanticMappings[token]) {
        const mapping = this.semanticMappings[token];

        // Skip if we've already processed this mapping
        if (processedMappings.has(mapping)) continue;

        semanticMatches.push({
          term: token,
          mapping,
          confidence: 1.0,
        });

        processedMappings.add(mapping);

        // Collect types
        if (mapping.types) {
          inferredTypes.push(...mapping.types);
        }

        // Collect characteristics
        if (mapping.characteristics) {
          Object.assign(inferredCharacteristics, mapping.characteristics);
        }
      }
    }

    // Fuzzy matching for partial matches
    for (const token of tokens) {
      if (!this.semanticMappings[token]) {
        const fuzzyMatches = this.findFuzzyMatches(token, processedMappings);
        semanticMatches.push(...fuzzyMatches);

        for (const match of fuzzyMatches) {
          if (match.mapping.types) {
            inferredTypes.push(...match.mapping.types);
          }
          if (match.mapping.characteristics) {
            Object.assign(
              inferredCharacteristics,
              match.mapping.characteristics
            );
          }
        }
      }
    }

    return {
      originalQuery,
      tokens,
      semanticMatches,
      inferredTypes: [...new Set(inferredTypes)],
      inferredCharacteristics,
    };
  }

  /**
   * Find fuzzy matches using simple string similarity
   */
  private findFuzzyMatches(
    token: string,
    alreadyProcessed: Set<SemanticMapping>
  ): Array<{
    term: string;
    mapping: SemanticMapping;
    confidence: number;
  }> {
    const matches: Array<{
      term: string;
      mapping: SemanticMapping;
      confidence: number;
    }> = [];

    for (const [key, mapping] of Object.entries(this.semanticMappings)) {
      // Skip if we've already processed this mapping
      if (alreadyProcessed.has(mapping)) continue;

      const similarity = this.calculateStringSimilarity(token, key);
      if (similarity > 0.6) {
        // Threshold for fuzzy matching
        matches.push({
          term: key,
          mapping,
          confidence: similarity,
        });
        alreadyProcessed.add(mapping);
        continue; // Don't check synonyms if we found a direct match
      }

      // Check synonyms too, but only if no direct match
      let bestSynonymMatch = { term: "", confidence: 0 };
      for (const synonym of mapping.synonyms) {
        const synonymSimilarity = this.calculateStringSimilarity(
          token,
          synonym
        );
        if (
          synonymSimilarity > bestSynonymMatch.confidence &&
          synonymSimilarity > 0.6
        ) {
          bestSynonymMatch = { term: synonym, confidence: synonymSimilarity };
        }
      }

      if (bestSynonymMatch.confidence > 0) {
        matches.push({
          term: bestSynonymMatch.term,
          mapping,
          confidence: bestSynonymMatch.confidence * 0.9, // Slightly lower confidence for synonyms
        });
        alreadyProcessed.add(mapping);
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 3); // Top 3 matches
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    const matrix = Array(len1 + 1)
      .fill(null)
      .map(() => Array(len2 + 1).fill(null));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len1][len2]) / maxLen;
  }

  /**
   * Generate search filters based on semantic analysis
   */
  generateSemanticFilters(
    semanticAnalysis: ReturnType<typeof this.parseSemanticQuery>
  ): {
    textSearch?: string;
    types?: string[];
    characteristics?: any;
    fallbackTypes?: string[];
  } {
    const {
      originalQuery,
      inferredTypes,
      inferredCharacteristics,
      semanticMatches,
    } = semanticAnalysis;

    // If we have high-confidence semantic matches, use them
    const highConfidenceMatches = semanticMatches.filter(
      (m) => m.confidence > 0.8
    );

    if (highConfidenceMatches.length > 0) {
      return {
        types: inferredTypes.length > 0 ? inferredTypes : undefined,
        characteristics:
          Object.keys(inferredCharacteristics).length > 0
            ? inferredCharacteristics
            : undefined,
        textSearch: originalQuery, // Keep original for text fallback
        fallbackTypes: inferredTypes,
      };
    }

    // Medium confidence - provide fallback options
    const mediumConfidenceMatches = semanticMatches.filter(
      (m) => m.confidence > 0.6
    );

    if (mediumConfidenceMatches.length > 0) {
      return {
        textSearch: originalQuery,
        fallbackTypes: inferredTypes,
        characteristics:
          Object.keys(inferredCharacteristics).length > 0
            ? inferredCharacteristics
            : undefined,
      };
    }

    // Low confidence - just text search
    return {
      textSearch: originalQuery,
    };
  }

  /**
   * Log semantic analysis for debugging
   */
  logSemanticAnalysis(
    analysis: ReturnType<typeof this.parseSemanticQuery>
  ): void {
    logger.info(
      `Semantic Analysis for "${
        analysis.originalQuery
      }": tokens=${JSON.stringify(analysis.tokens)}, matches=${
        analysis.semanticMatches.length
      }, types=${JSON.stringify(analysis.inferredTypes)}`
    );
  }
}
