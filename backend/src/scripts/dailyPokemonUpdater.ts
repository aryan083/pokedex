import axios from 'axios';
import dotenv from 'dotenv';
import { syncDatabase, Pokemon } from '../models';
import { logger } from '../middlewares/requestLogger.middleware';
import { redisClient } from '../config/redis';

// Load environment variables
dotenv.config();

interface PokeAPISpecies {
  name: string;
  url: string;
  id?: number;
}

interface PokeAPIType {
  slot: number;
  type: {
    name: string;
  };
}

interface PokeAPIStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

interface PokeAPIDetail {
  id: number;
  name: string;
  types: PokeAPIType[];
  stats: PokeAPIStat[];
  species: {
    url: string;
  };
}

const getTypeFromUrl = (url: string): number => {
  const parts = url.split('/');
  return parseInt(parts[parts.length - 2], 10);
};

const fetchGeneration = async (speciesUrl: string): Promise<number> => {
  try {
    const response = await axios.get(speciesUrl);
    const generationUrl = response.data.generation.url;
    return getTypeFromUrl(generationUrl);
  } catch (error: any) {
    logger.error(`Error fetching generation: ${error.message}`);
    return 1; // Default to generation 1
  }
};

const fetchAllPokemon = async (): Promise<PokeAPISpecies[]> => {
  try {
    logger.info('Fetching list of all Pokémon...');
    
    const allPokemon: PokeAPISpecies[] = [];
    let nextUrl: string | null = 'https://pokeapi.co/api/v2/pokemon?limit=1000';
    
    // Fetch all Pokémon in batches
    while (nextUrl) {
      const response: any = await axios.get(nextUrl);
      const data: any = response.data;
      
      // Add current batch to our list
      allPokemon.push(...data.results);
      
      // Get next page URL
      nextUrl = data.next;
      
      logger.info(`Fetched ${allPokemon.length} Pokémon so far...`);
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    logger.info(`Total Pokémon fetched: ${allPokemon.length}`);
    return allPokemon;
  } catch (error: any) {
    logger.error(`Error fetching Pokémon list: ${error.message}`);
    throw error;
  }
};

const fetchPokemonDetails = async (pokemonList: PokeAPISpecies[]): Promise<any[]> => {
  try {
    logger.info(`Fetching details for ${pokemonList.length} Pokémon...`);
    
    const pokemonData = [];
    
    for (let i = 0; i < pokemonList.length; i++) {
      const species = pokemonList[i];
      logger.info(`Fetching ${i + 1}/${pokemonList.length}: ${species.name}`);
      
      try {
        const response = await axios.get(species.url);
        const detail: PokeAPIDetail = response.data;
        
        // Extract stats
        const stats: Record<string, number> = {};
        detail.stats.forEach(stat => {
          stats[stat.stat.name] = stat.base_stat;
        });
        
        // Extract types
        const types = detail.types.map(type => type.type.name);
        
        // Fetch generation
        const generation = await fetchGeneration(detail.species.url);
        
        // Create searchable text
        const searchText = [
          detail.name,
          ...types,
          Object.keys(stats).map(key => `${key}:${stats[key]}`)
        ].join(' ');
        
        pokemonData.push({
          pokemonId: detail.id,
          name: detail.name,
          generation,
          hp: stats.hp || 0,
          attack: stats.attack || 0,
          defense: stats.defense || 0,
          speed: stats.speed || 0,
          types,
          searchText
        });
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        logger.error(`Error fetching ${species.name}: ${error.message}`);
      }
    }
    
    return pokemonData;
  } catch (error: any) {
    logger.error(`Error fetching Pokémon details: ${error.message}`);
    throw error;
  }
};

const updateDatabase = async (pokemonData: any[]) => {
  try {
    logger.info(`Updating database with ${pokemonData.length} Pokémon...`);
    
    // Remove duplicates by pokemonId, keeping the first occurrence
    const uniquePokemonData = pokemonData.filter((pokemon, index, self) =>
      index === self.findIndex(p => p.pokemonId === pokemon.pokemonId)
    );
    
    logger.info(`Filtered to ${uniquePokemonData.length} unique Pokémon (removed ${pokemonData.length - uniquePokemonData.length} duplicates)`);
    
    // Insert or update data
    const result = await Pokemon.bulkCreate(uniquePokemonData, {
      updateOnDuplicate: ['name', 'generation', 'hp', 'attack', 'defense', 'speed', 'types', 'searchText']
    });
    
    logger.info(`Successfully updated ${result.length} Pokémon in database`);
    
    // Update cache invalidation timestamp
    const timestamp = new Date().toISOString();
    await redisClient.set('pokemon:last_updated', timestamp);
    logger.info(`Cache invalidation timestamp updated: ${timestamp}`);
    
    return result.length;
  } catch (error: any) {
    logger.error(`Error updating database: ${error.message}`);
    throw error;
  }
};

const clearExpiredCache = async () => {
  try {
    logger.info('Clearing expired cache entries...');
    
    // Get all cache keys that start with 'search:'
    const keys = await redisClient.keys('search:*');
    if (keys.length > 0) {
      await redisClient.del(...keys);
      logger.info(`Cleared ${keys.length} cache entries`);
    } else {
      logger.info('No cache entries to clear');
    }
  } catch (error: any) {
    logger.error(`Error clearing cache: ${error.message}`);
  }
};

const updatePokemonData = async () => {
  try {
    logger.info('Starting daily Pokémon data update process...');
    
    // Sync database
    await syncDatabase();
    
    // Fetch all Pokémon
    const pokemonList = await fetchAllPokemon();
    
    // Fetch details for all Pokémon
    const pokemonData = await fetchPokemonDetails(pokemonList);
    
    // Update database
    const updatedCount = await updateDatabase(pokemonData);
    
    // Clear cache to force refresh
    await clearExpiredCache();
    
    logger.info(`Daily update completed. Updated ${updatedCount} Pokémon.`);
    return updatedCount;
  } catch (error: any) {
    logger.error(`Error in daily update process: ${error.message}`);
    throw error;
  }
};

// Function to run as a one-time update
export const runPokemonUpdate = async () => {
  try {
    const startTime = Date.now();
    const count = await updatePokemonData();
    const endTime = Date.now();
    
    logger.info(`Pokemon update completed in ${(endTime - startTime) / 1000} seconds. Updated ${count} Pokémon.`);
    process.exit(0);
  } catch (error: any) {
    logger.error(`Pokemon update failed: ${error.message}`);
    process.exit(1);
  }
};

// Function to run as a scheduled job
export const schedulePokemonUpdate = async () => {
  try {
    // Run update
    const count = await updatePokemonData();
    
    // Log completion
    logger.info(`Scheduled pokemon update completed. Updated ${count} Pokémon.`);
    
    // Return success
    return true;
  } catch (error: any) {
    logger.error(`Scheduled pokemon update failed: ${error.message}`);
    return false;
  }
};

// Run if called directly
if (require.main === module) {
  runPokemonUpdate();
}