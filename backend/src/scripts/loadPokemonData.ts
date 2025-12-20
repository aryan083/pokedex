import dotenv from 'dotenv';
// @ts-nocheck
import fs from 'fs';
import path from 'path';
import { syncDatabase, Pokemon } from '../models';
import { logger } from '../middlewares/requestLogger.middleware';

// Load environment variables
dotenv.config();

// Define paths for data files
const DATA_DIR = path.join(__dirname, '../../data');
const POKEMON_DATA_FILE = path.join(DATA_DIR, 'pokemon_data.json');

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

const loadPokemonDataFromFile = async (): Promise<PokemonData[] | null> => {
  try {
    // Check if data file exists
    if (!fs.existsSync(POKEMON_DATA_FILE)) {
      logger.error('No existing Pokémon data file found');
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
    
    // Clear existing data
    await Pokemon.destroy({ where: {} });
    logger.info('Cleared existing Pokémon data from database');
    
    // Insert data
    const result = await Pokemon.bulkCreate(uniquePokemonData);
    
    logger.info(`Successfully inserted ${result.length} Pokémon into database`);
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

const loadPokemonData = async () => {
  try {
    logger.info('Starting Pokémon data load process...');
    
    // Sync database
    await syncDatabase();
    
    // Load data from file
    const pokemonData = await loadPokemonDataFromFile();
    
    if (!pokemonData) {
      logger.error('No data to load');
      process.exit(1);
      return;
    }
    
    // Update database
    const insertedCount = await updateDatabaseFromData(pokemonData);
    
    logger.info(`Data load completed. Inserted ${insertedCount} Pokémon.`);
    process.exit(0);
  } catch (error: any) {
    logger.error(`Error in data load process: ${error.message}`);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  loadPokemonData();
}