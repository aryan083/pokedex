import dotenv from 'dotenv';
import { syncDatabase, Pokemon } from '../models';
import { logger } from '../middlewares/requestLogger.middleware';

// Load environment variables
dotenv.config();

// Sample Pokémon data
const samplePokemonData = [
  {
    pokemonId: 1,
    name: 'bulbasaur',
    generation: 1,
    hp: 45,
    attack: 49,
    defense: 49,
    speed: 45,
    types: ['grass', 'poison'],
    searchText: 'bulbasaur grass poison'
  },
  {
    pokemonId: 2,
    name: 'ivysaur',
    generation: 1,
    hp: 60,
    attack: 62,
    defense: 63,
    speed: 60,
    types: ['grass', 'poison'],
    searchText: 'ivysaur grass poison'
  },
  {
    pokemonId: 3,
    name: 'venusaur',
    generation: 1,
    hp: 80,
    attack: 82,
    defense: 83,
    speed: 80,
    types: ['grass', 'poison'],
    searchText: 'venusaur grass poison'
  },
  {
    pokemonId: 4,
    name: 'charmander',
    generation: 1,
    hp: 39,
    attack: 52,
    defense: 43,
    speed: 65,
    types: ['fire'],
    searchText: 'charmander fire'
  },
  {
    pokemonId: 5,
    name: 'charmeleon',
    generation: 1,
    hp: 58,
    attack: 64,
    defense: 58,
    speed: 80,
    types: ['fire'],
    searchText: 'charmeleon fire'
  },
  {
    pokemonId: 6,
    name: 'charizard',
    generation: 1,
    hp: 78,
    attack: 84,
    defense: 78,
    speed: 100,
    types: ['fire', 'flying'],
    searchText: 'charizard fire flying'
  },
  {
    pokemonId: 7,
    name: 'squirtle',
    generation: 1,
    hp: 44,
    attack: 48,
    defense: 65,
    speed: 43,
    types: ['water'],
    searchText: 'squirtle water'
  },
  {
    pokemonId: 8,
    name: 'wartortle',
    generation: 1,
    hp: 59,
    attack: 63,
    defense: 80,
    speed: 58,
    types: ['water'],
    searchText: 'wartortle water'
  },
  {
    pokemonId: 9,
    name: 'blastoise',
    generation: 1,
    hp: 79,
    attack: 83,
    defense: 100,
    speed: 78,
    types: ['water'],
    searchText: 'blastoise water'
  },
  {
    pokemonId: 25,
    name: 'pikachu',
    generation: 1,
    hp: 35,
    attack: 55,
    defense: 40,
    speed: 90,
    types: ['electric'],
    searchText: 'pikachu electric'
  },
  {
    pokemonId: 26,
    name: 'raichu',
    generation: 1,
    hp: 60,
    attack: 90,
    defense: 55,
    speed: 110,
    types: ['electric'],
    searchText: 'raichu electric'
  },
  {
    pokemonId: 150,
    name: 'mewtwo',
    generation: 1,
    hp: 106,
    attack: 110,
    defense: 90,
    speed: 130,
    types: ['psychic'],
    searchText: 'mewtwo psychic'
  },
  {
    pokemonId: 151,
    name: 'mew',
    generation: 1,
    hp: 100,
    attack: 100,
    defense: 100,
    speed: 100,
    types: ['psychic'],
    searchText: 'mew psychic'
  },
  {
    pokemonId: 249,
    name: 'lugia',
    generation: 2,
    hp: 106,
    attack: 90,
    defense: 130,
    speed: 110,
    types: ['psychic', 'flying'],
    searchText: 'lugia psychic flying'
  },
  {
    pokemonId: 250,
    name: 'ho-oh',
    generation: 2,
    hp: 106,
    attack: 130,
    defense: 90,
    speed: 90,
    types: ['fire', 'flying'],
    searchText: 'ho-oh fire flying'
  },
  {
    pokemonId: 384,
    name: 'rayquaza',
    generation: 3,
    hp: 105,
    attack: 150,
    defense: 90,
    speed: 95,
    types: ['dragon', 'flying'],
    searchText: 'rayquaza dragon flying'
  },
  {
    pokemonId: 483,
    name: 'dialga',
    generation: 4,
    hp: 100,
    attack: 120,
    defense: 120,
    speed: 90,
    types: ['steel', 'dragon'],
    searchText: 'dialga steel dragon'
  },
  {
    pokemonId: 484,
    name: 'palkia',
    generation: 4,
    hp: 90,
    attack: 120,
    defense: 100,
    speed: 100,
    types: ['water', 'dragon'],
    searchText: 'palkia water dragon'
  },
  {
    pokemonId: 643,
    name: 'reshiram',
    generation: 5,
    hp: 100,
    attack: 120,
    defense: 100,
    speed: 90,
    types: ['dragon', 'fire'],
    searchText: 'reshiram dragon fire'
  },
  {
    pokemonId: 644,
    name: 'zekrom',
    generation: 5,
    hp: 100,
    attack: 150,
    defense: 120,
    speed: 90,
    types: ['dragon', 'electric'],
    searchText: 'zekrom dragon electric'
  },
  {
    pokemonId: 716,
    name: 'xerneas',
    generation: 6,
    hp: 126,
    attack: 131,
    defense: 95,
    speed: 99,
    types: ['fairy'],
    searchText: 'xerneas fairy'
  },
  {
    pokemonId: 717,
    name: 'yveltal',
    generation: 6,
    hp: 126,
    attack: 131,
    defense: 95,
    speed: 99,
    types: ['dark', 'flying'],
    searchText: 'yveltal dark flying'
  },
  {
    pokemonId: 785,
    name: 'tapu-koko',
    generation: 7,
    hp: 70,
    attack: 115,
    defense: 85,
    speed: 130,
    types: ['electric', 'fairy'],
    searchText: 'tapu-koko electric fairy'
  },
  {
    pokemonId: 786,
    name: 'tapu-lele',
    generation: 7,
    hp: 70,
    attack: 85,
    defense: 115,
    speed: 130,
    types: ['psychic', 'fairy'],
    searchText: 'tapu-lele psychic fairy'
  },
  {
    pokemonId: 787,
    name: 'tapu-bulu',
    generation: 7,
    hp: 70,
    attack: 130,
    defense: 115,
    speed: 75,
    types: ['grass', 'fairy'],
    searchText: 'tapu-bulu grass fairy'
  },
  {
    pokemonId: 788,
    name: 'tapu-fini',
    generation: 7,
    hp: 70,
    attack: 75,
    defense: 115,
    speed: 85,
    types: ['water', 'fairy'],
    searchText: 'tapu-fini water fairy'
  },
  {
    pokemonId: 800,
    name: 'necrozma',
    generation: 7,
    hp: 97,
    attack: 107,
    defense: 101,
    speed: 79,
    types: ['psychic'],
    searchText: 'necrozma psychic'
  },
  {
    pokemonId: 888,
    name: 'zacian',
    generation: 8,
    hp: 92,
    attack: 130,
    defense: 115,
    speed: 138,
    types: ['fairy', 'steel'],
    searchText: 'zacian fairy steel'
  },
  {
    pokemonId: 889,
    name: 'zamazenta',
    generation: 8,
    hp: 92,
    attack: 130,
    defense: 115,
    speed: 138,
    types: ['fighting', 'steel'],
    searchText: 'zamazenta fighting steel'
  },
  {
    pokemonId: 890,
    name: 'eternatus',
    generation: 8,
    hp: 140,
    attack: 85,
    defense: 95,
    speed: 130,
    types: ['poison', 'dragon'],
    searchText: 'eternatus poison dragon'
  },
  {
    pokemonId: 891,
    name: 'kubfu',
    generation: 8,
    hp: 60,
    attack: 90,
    defense: 60,
    speed: 72,
    types: ['fighting'],
    searchText: 'kubfu fighting'
  },
  {
    pokemonId: 892,
    name: 'urshifu',
    generation: 8,
    hp: 100,
    attack: 130,
    defense: 100,
    speed: 97,
    types: ['fighting', 'water'],
    searchText: 'urshifu fighting water'
  },
  {
    pokemonId: 893,
    name: 'zarude',
    generation: 8,
    hp: 105,
    attack: 120,
    defense: 105,
    speed: 105,
    types: ['dark', 'grass'],
    searchText: 'zarude dark grass'
  },
  {
    pokemonId: 898,
    name: 'calyrex',
    generation: 8,
    hp: 100,
    attack: 80,
    defense: 80,
    speed: 80,
    types: ['psychic', 'grass'],
    searchText: 'calyrex psychic grass'
  },
  {
    pokemonId: 905,
    name: 'enamorus',
    generation: 8,
    hp: 74,
    attack: 115,
    defense: 70,
    speed: 106,
    types: ['fairy', 'flying'],
    searchText: 'enamorus fairy flying'
  },
  {
    pokemonId: 1000,
    name: 'gholdengo',
    generation: 9,
    hp: 87,
    attack: 60,
    defense: 91,
    speed: 84,
    types: ['steel', 'ghost'],
    searchText: 'gholdengo steel ghost'
  },
  {
    pokemonId: 1001,
    name: 'wo-chien',
    generation: 9,
    hp: 85,
    attack: 85,
    defense: 100,
    speed: 70,
    types: ['dark', 'grass'],
    searchText: 'wo-chien dark grass'
  },
  {
    pokemonId: 1002,
    name: 'chien-pao',
    generation: 9,
    hp: 80,
    attack: 120,
    defense: 80,
    speed: 135,
    types: ['dark', 'ice'],
    searchText: 'chien-pao dark ice'
  },
  {
    pokemonId: 1003,
    name: 'ting-lu',
    generation: 9,
    hp: 155,
    attack: 110,
    defense: 125,
    speed: 45,
    types: ['dark', 'ground'],
    searchText: 'ting-lu dark ground'
  },
  {
    pokemonId: 1004,
    name: 'chi-yu',
    generation: 9,
    hp: 55,
    attack: 80,
    defense: 80,
    speed: 100,
    types: ['dark', 'fire'],
    searchText: 'chi-yu dark fire'
  }
];

const seedPokemon = async () => {
  try {
    // Sync database
    await syncDatabase();
    
    // Clear existing data
    await Pokemon.destroy({ where: {} });
    
    // Insert sample data
    const result = await Pokemon.bulkCreate(samplePokemonData, {
      updateOnDuplicate: ['name', 'generation', 'hp', 'attack', 'defense', 'speed', 'types', 'searchText']
    });
    
    logger.info(`Successfully seeded ${result.length} Pokémon`);
    process.exit(0);
  } catch (error: any) {
    logger.error(`Error seeding Pokémon data: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
seedPokemon();