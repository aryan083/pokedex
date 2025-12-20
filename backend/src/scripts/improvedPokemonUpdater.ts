// @ts-nocheck
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { syncDatabase, Pokemon } from '../models';
import { logger } from '../middlewares/requestLogger.middleware';

// Load environment variables
dotenv.config();

// Define paths for data files
const DATA_DIR = path.join(__dirname, '../../data');
const POKEMON_DATA_FILE = path.join(DATA_DIR, 'pokemon_data.json');
const LAST_UPDATE_FILE = path.join(DATA_DIR, 'last_update.txt');

interface PokemonData {
  pokemonId: number;
  name: string;
  generation: number;
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
  searchText: string;
}

interface PokeAPISpecies {
  name: string;
  url: string;
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

const fetchPokemonDetails = async (pokemonList: PokeAPISpecies[]): Promise<PokemonData[]> => {
  try {
    logger.info(`Fetching details for ${pokemonList.length} Pokémon...`);
    
    const pokemonData: PokemonData[] = [];
    
    for (let i = 0; i < pokemonList.length; i++) {
      const species = pokemonList[i];
      logger.info(`Fetching ${i + 1}/${pokemonList.length}: ${species.name}`);
      
      try {
        const response: any = await axios.get(species.url);
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

const savePokemonDataToFile = async (pokemonData: PokemonData[]): Promise<void> => {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // Save Pokémon data to JSON file
    fs.writeFileSync(POKEMON_DATA_FILE, JSON.stringify(pokemonData, null, 2));
    logger.info(`Saved ${pokemonData.length} Pokémon to ${POKEMON_DATA_FILE}`);
    
    // Save timestamp
    const timestamp = new Date().toISOString();
    fs.writeFileSync(LAST_UPDATE_FILE, timestamp);
    logger.info(`Last update timestamp saved: ${timestamp}`);
  } catch (error: any) {
    logger.error(`Error saving Pokémon data to file: ${error.message}`);
    throw error;
  }
};

const loadPokemonDataFromFile = async (): Promise<PokemonData[] | null> => {
  try {
    // Check if data file exists
    if (!fs.existsSync(POKEMON_DATA_FILE)) {
      logger.info('No existing Pokémon data file found');
      return null;
    }
    
    // Load Pokémon data from JSON file
    const data = fs.readFileSync(POKEMON_DATA_FILE, 'utf8');
    const pokemonData: PokemonData[] = JSON.parse(data);
    logger.info(`Loaded ${pokemonData.length} Pokémon from ${POKEMON_DATA_FILE}`);
    
    return pokemonData;
  } catch (error: any) {
    logger.error(`Error loading Pokémon data from file: ${error.message}`);
    return null;
  }
};

const updateDatabaseFromData = async (pokemonData: PokemonData[]): Promise<number> => {
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
    return result.length;
  } catch (error: any) {
    logger.error(`Error updating database: ${error.message}`);
    if (error.errors) {
      error.errors.forEach((err: any) => {
        logger.error(`Validation error: ${err.path} - ${err.message}`);
      });
    }
    throw error;
  }
};

const updatePokemonData = async (): Promise<{ fetched: number; updated: number }> => {
  try {
    logger.info('Starting Pokémon data update process...');
    
    // Sync database
    await syncDatabase();
    
    // Fetch all Pokémon
    const pokemonList = await fetchAllPokemon();
    
    // Fetch details for all Pokémon
    const pokemonData = await fetchPokemonDetails(pokemonList);
    
    // Save to file for fast access
    await savePokemonDataToFile(pokemonData);
    
    // Update database
    const updatedCount = await updateDatabaseFromData(pokemonData);
    
    logger.info(`Update completed. Fetched ${pokemonData.length}, Updated ${updatedCount} Pokémon in database.`);
    return { fetched: pokemonData.length, updated: updatedCount };
  } catch (error: any) {
    logger.error(`Error in update process: ${error.message}`);
    if (error.errors) {
      error.errors.forEach((err: any) => {
        logger.error(`Detailed error: ${err.path} - ${err.message}`);
      });
    }
    throw error;
  }
};

// Function to get cached Pokémon data (fast access)
export const getCachedPokemonData = async (): Promise<PokemonData[] | null> => {
  return await loadPokemonDataFromFile();
};

// Function to check when data was last updated
export const getLastUpdateTimestamp = async (): Promise<string | null> => {
  try {
    if (!fs.existsSync(LAST_UPDATE_FILE)) {
      return null;
    }
    return fs.readFileSync(LAST_UPDATE_FILE, 'utf8').trim();
  } catch (error: any) {
    logger.error(`Error reading last update timestamp: ${error.message}`);
    return null;
  }
};

// Function to run as a one-time update
export const runPokemonUpdate = async () => {
  try {
    const startTime = Date.now();
    const result = await updatePokemonData();
    const endTime = Date.now();
    
    logger.info(`Pokemon update completed in ${(endTime - startTime) / 1000} seconds. Fetched ${result.fetched}, Updated ${result.updated} Pokémon.`);
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
    const result = await updatePokemonData();
    
    // Log completion
    logger.info(`Scheduled pokemon update completed. Fetched ${result.fetched}, Updated ${result.updated} Pokémon.`);
    
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