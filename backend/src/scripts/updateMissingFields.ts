// @ts-nocheck
import axios from 'axios';
import dotenv from 'dotenv';
import { syncDatabase, Pokemon } from '../models';
import { logger } from '../middlewares/requestLogger.middleware';

dotenv.config();

// Update Pokemon with missing fields from PokeAPI
const updatePokemonFields = async () => {
  try {
    logger.info('Starting update process for missing Pokemon fields...');
    
    // Sync database
    await syncDatabase();
    
    // Get all Pokemon from database that need updates (where specialAttack is 0)
    const pokemonToUpdate = await Pokemon.findAll({
      where: {},
      order: [['pokemonId', 'ASC']]
    });
    
    logger.info(`Found ${pokemonToUpdate.length} Pokemon to update`);
    
    let updated = 0;
    let failed = 0;
    
    for (let i = 0; i < pokemonToUpdate.length; i++) {
      const pokemon = pokemonToUpdate[i];
      
      // Only update if fields are missing (0 or empty)
      if (pokemon.specialAttack !== 0 && pokemon.height !== 0 && pokemon.abilities.length > 0) {
        logger.info(`Skipping ${pokemon.name} - already has data`);
        continue;
      }
      
      logger.info(`Updating ${i + 1}/${pokemonToUpdate.length}: ${pokemon.name} (ID: ${pokemon.pokemonId})`);
      
      try {
        // Fetch from PokeAPI
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.pokemonId}`);
        const detail = response.data;
        
        // Extract stats
        const stats: Record<string, number> = {};
        detail.stats.forEach((stat: any) => {
          stats[stat.stat.name] = stat.base_stat;
        });
        
        // Extract abilities
        const abilities = detail.abilities?.map((ability: any) => ability.ability.name) || [];
        
        // Update the Pokemon
        await pokemon.update({
          specialAttack: stats['special-attack'] || 0,
          specialDefense: stats['special-defense'] || 0,
          height: detail.height || 0,
          weight: detail.weight || 0,
          abilities: abilities
        });
        
        updated++;
        logger.info(`✓ Updated ${pokemon.name}: SpAtk=${stats['special-attack']}, SpDef=${stats['special-defense']}, H=${detail.height}, W=${detail.weight}, Abilities=${abilities.length}`);
        
        // Add delay to respect rate limits (100ms)
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        failed++;
        logger.error(`✗ Error updating ${pokemon.name}: ${error.message}`);
        
        // Continue with next Pokemon even if this one fails
        continue;
      }
    }
    
    logger.info(`Update complete! Updated: ${updated}, Failed: ${failed}, Total: ${pokemonToUpdate.length}`);
    process.exit(0);
  } catch (error: any) {
    logger.error(`Error in update process: ${error.message}`);
    process.exit(1);
  }
};

// Run the updater
updatePokemonFields();
