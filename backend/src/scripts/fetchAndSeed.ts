import axios from 'axios';
import dotenv from 'dotenv';
import { syncDatabase, Pokemon } from '../models';
import { logger } from '../middlewares/requestLogger.middleware';

// Load environment variables
dotenv.config();

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
  height: number;
  weight: number;
  abilities: Array<{
    ability: {
      name: string;
    };
  }>;
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

const fetchPokemonDetails = async (limit: number = 151): Promise<any[]> => {
  try {
    // Fetch list of Pokémon
    const listResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
    const pokemonList: PokeAPISpecies[] = listResponse.data.results;
    
    logger.info(`Found ${pokemonList.length} Pokémon to fetch`);
    
    // Fetch details for each Pokémon
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
        
        // Extract abilities
        const abilities = detail.abilities?.map(ability => ability.ability.name) || [];
        
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
          specialAttack: stats['special-attack'] || 0,
          specialDefense: stats['special-defense'] || 0,
          speed: stats.speed || 0,
          height: detail.height || 0,
          weight: detail.weight || 0,
          types,
          abilities,
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
    logger.error(`Error fetching Pokémon list: ${error.message}`);
    throw error;
  }
};

const seedDatabase = async (limit: number = 151) => {
  try {
    logger.info('Starting Pokémon data fetch and seed process...');
    
    // Sync database
    await syncDatabase();
    
    // Fetch Pokémon data
    const pokemonData = await fetchPokemonDetails(limit);
    
    logger.info(`Fetched data for ${pokemonData.length} Pokémon`);
    
    // Clear existing data
    await Pokemon.destroy({ where: {} });
    
    // Insert data
    const result = await Pokemon.bulkCreate(pokemonData, {
      updateOnDuplicate: ['name', 'generation', 'hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed', 'height', 'weight', 'types', 'abilities', 'searchText']
    });
    
    logger.info(`Successfully seeded ${result.length} Pokémon`);
    process.exit(0);
  } catch (error: any) {
    logger.error(`Error in seed process: ${error.message}`);
    process.exit(1);
  }
};

// Get limit from command line arguments or default to 10000 (fetch all available)
const limit = process.argv[2] ? parseInt(process.argv[2], 10) : 10000;

// Run the seeder
seedDatabase(limit);