import { Op, WhereOptions } from 'sequelize';
import { Pokemon } from '../models';
import { logger } from '../middlewares/requestLogger.middleware';

// Define filter criteria interface
export interface PokemonFilters {
  type?: string; // Comma-separated string of types
  generation?: string; // Comma-separated string of generations
  minHp?: number;
  minAttack?: number;
  minDefense?: number;
  minSpeed?: number;
  search?: string;
}

// Define sorting options
export type SortField = 'pokemonId' | 'name' | 'hp' | 'attack' | 'defense' | 'speed';
export type SortOrder = 'ASC' | 'DESC';

export interface PokemonRepository {
  findAll(filters: PokemonFilters, page: number, limit: number, sortField: SortField, sortOrder: SortOrder): Promise<{ pokemons: Pokemon[]; totalCount: number }>;
  findById(id: number): Promise<Pokemon | null>;
  findByName(name: string): Promise<Pokemon | null>;
  findByNames(names: string[]): Promise<Pokemon[]>;
  bulkCreate(pokemons: any[]): Promise<Pokemon[]>;
  count(): Promise<number>;
}

export class PokemonRepositoryImpl implements PokemonRepository {
  async findAll(
    filters: PokemonFilters,
    page: number,
    limit: number,
    sortField: SortField,
    sortOrder: SortOrder
  ): Promise<{ pokemons: Pokemon[]; totalCount: number }> {
    try {
      const offset = (page - 1) * limit;
      
      // Build where conditions
      const whereConditions: WhereOptions = {};
      
      // Handle multiple generations
      if (filters.generation) {
        const generations = filters.generation.split(',').map(g => parseInt(g.trim(), 10)).filter(g => !isNaN(g));
        if (generations.length > 0) {
          whereConditions.generation = { [Op.in]: generations };
        }
      }
      
      if (filters.minHp !== undefined) {
        whereConditions.hp = { [Op.gte]: filters.minHp };
      }
      
      if (filters.minAttack !== undefined) {
        whereConditions.attack = { [Op.gte]: filters.minAttack };
      }
      
      if (filters.minDefense !== undefined) {
        whereConditions.defense = { [Op.gte]: filters.minDefense };
      }
      
      if (filters.minSpeed !== undefined) {
        whereConditions.speed = { [Op.gte]: filters.minSpeed };
      }
      
      // Handle multiple type filters (array field)
      let typeCondition = {};
      if (filters.type) {
        const types = filters.type.split(',').map(t => t.trim()).filter(Boolean);
        if (types.length > 0) {
          // For PostgreSQL array field, we need to check if any of the types are contained
          // Using overlap operator ([Op.overlap]) to check if arrays have any elements in common
          // This will find Pokémon that have ANY of the specified types
          typeCondition = {
            types: {
              [Op.overlap]: types
            }
          };
        }
      }
      
      // Handle search filter
      let searchCondition = {};
      if (filters.search) {
        // Check for semantic terms
        const searchTerm = filters.search.toLowerCase().trim();
        
        logger.info(`Processing search term: ${searchTerm}`);
        
        // Handle semantic search terms
        if (searchTerm === 'fast') {
          whereConditions.speed = { [Op.gt]: 100 };
        } else if (searchTerm === 'tank') {
          // For tank, we'll handle it after getting results
        } else if (searchTerm === 'glass') {
          whereConditions.attack = { [Op.gt]: 100 };
          whereConditions.defense = { [Op.lt]: 70 };
        } else {
          // Regular text search using ILIKE for name matching
          searchCondition = {
            name: { [Op.iLike]: `%${searchTerm}%` }
          };
          logger.info(`Search condition created: ${JSON.stringify(searchCondition)}`);
        }
      }
      
      // Combine all conditions except for tank
      const conditionsToCombine = [whereConditions, typeCondition, searchCondition].filter(
        condition => Object.keys(condition).length > 0
      );
      
      logger.info(`Conditions to combine: ${JSON.stringify(conditionsToCombine)}`);
      
      const finalWhere = conditionsToCombine.length > 0 ? { [Op.and]: conditionsToCombine } : {};
      
      logger.info(`Final WHERE clause: ${JSON.stringify(finalWhere)}`);
      
      // Special handling for tank semantic search
      if (filters.search?.toLowerCase().trim() === 'tank') {
        const { count, rows } = await Pokemon.findAndCountAll({
          where: finalWhere,
          order: [[sortField, sortOrder]],
          limit,
          offset,
        });
        
        // Filter for tank condition (hp + defense > 200) in memory
        const filteredRows = rows.filter(pokemon => (pokemon.hp + pokemon.defense) > 200);
        
        return {
          pokemons: filteredRows,
          totalCount: count
        };
      }
      
      const { count, rows } = await Pokemon.findAndCountAll({
        where: finalWhere,
        order: [[sortField, sortOrder]],
        limit,
        offset,
      });
      
      return {
        pokemons: rows,
        totalCount: count
      };
    } catch (error: any) {
      logger.error(`Error in PokemonRepository.findAll: ${error.message}`);
      throw error;
    }
  }
  
  async findById(id: number): Promise<Pokemon | null> {
    try {
      return await Pokemon.findByPk(id);
    } catch (error: any) {
      logger.error(`Error in PokemonRepository.findById: ${error.message}`);
      throw error;
    }
  }
  
  async findByName(name: string): Promise<Pokemon | null> {
    try {
      return await Pokemon.findOne({
        where: {
          name: {
            [Op.iLike]: name
          }
        }
      });
    } catch (error: any) {
      logger.error(`Error in PokemonRepository.findByName: ${error.message}`);
      throw error;
    }
  }
  
  async findByNames(names: string[]): Promise<Pokemon[]> {
    try {
      return await Pokemon.findAll({
        where: {
          name: {
            [Op.in]: names
          }
        }
      });
    } catch (error: any) {
      logger.error(`Error in PokemonRepository.findByNames: ${error.message}`);
      throw error;
    }
  }
  
  async bulkCreate(pokemons: any[]): Promise<Pokemon[]> {
    try {
      return await Pokemon.bulkCreate(pokemons, {
        updateOnDuplicate: ['name', 'generation', 'hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed', 'height', 'weight', 'types', 'abilities', 'searchText']
      });
    } catch (error: any) {
      logger.error(`Error in PokemonRepository.bulkCreate: ${error.message}`);
      throw error;
    }
  }
  
  async count(): Promise<number> {
    try {
      return await Pokemon.count();
    } catch (error: any) {
      logger.error(`Error in PokemonRepository.count: ${error.message}`);
      throw error;
    }
  }
}