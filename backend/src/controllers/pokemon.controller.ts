import { Request, Response } from 'express';
import { PokemonService } from '../services/pokemon.service';
import { SearchParams } from '../services/search.service';
import { errorResponse, successResponse } from '../utils/response';
import { logger } from '../middlewares/requestLogger.middleware';

export class PokemonController {
  private pokemonService: PokemonService;

  constructor(pokemonService: PokemonService) {
    this.pokemonService = pokemonService;
  }

  // GET /api/pokemon
  searchPokemons = async (req: Request, res: Response) => {
    try {
      // Handle multiple types and generations
      let types: string[] | undefined;
      if (req.query.type) {
        if (Array.isArray(req.query.type)) {
          types = req.query.type as string[];
        } else {
          // Split comma-separated types
          types = (req.query.type as string).split(',').map(t => t.trim()).filter(Boolean);
        }
      }
      
      let generations: number[] | undefined;
      if (req.query.generation) {
        if (Array.isArray(req.query.generation)) {
          generations = (req.query.generation as string[]).map(g => parseInt(g, 10));
        } else {
          // Split comma-separated generations
          generations = (req.query.generation as string).split(',').map(g => parseInt(g.trim(), 10)).filter(g => !isNaN(g));
        }
      }
      
      const searchParams: SearchParams = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        type: types?.join(','), // Pass as comma-separated string for backward compatibility
        generation: generations && generations.length > 0 ? generations.join(',') : undefined, // Pass as comma-separated string for backward compatibility
        minHp: req.query.minHp ? parseInt(req.query.minHp as string, 10) : undefined,
        minAttack: req.query.minAttack ? parseInt(req.query.minAttack as string, 10) : undefined,
        minDefense: req.query.minDefense ? parseInt(req.query.minDefense as string, 10) : undefined,
        minSpeed: req.query.minSpeed ? parseInt(req.query.minSpeed as string, 10) : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
      };

      const result = await this.pokemonService.searchPokemons(searchParams);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error in PokemonController.searchPokemons:', error);
      return res.status(500).json(
        errorResponse(
          error.message || 'Failed to search Pokémon',
          'SEARCH_ERROR'
        )
      );
    }
  };

  // POST /api/pokemon/compare
  comparePokemons = async (req: Request, res: Response) => {
    try {
      const { pokemon } = req.body;

      if (!Array.isArray(pokemon) || pokemon.length < 2 || pokemon.length > 3) {
        return res.status(400).json(
          errorResponse(
            'Must provide 2-3 Pokémon for comparison',
            'INVALID_REQUEST'
          )
        );
      }

      const result = await this.pokemonService.comparePokemons({ pokemon });
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error in PokemonController.comparePokemons:', error);
      return res.status(500).json(
        errorResponse(
          error.message || 'Failed to compare Pokémon',
          'COMPARISON_ERROR'
        )
      );
    }
  };

  // Health check endpoint
  healthCheck = async (req: Request, res: Response) => {
    try {
      return res.status(200).json(
        successResponse(
          { status: 'OK', timestamp: new Date().toISOString() },
          {},
          'Service is healthy'
        )
      );
    } catch (error: any) {
      logger.error('Error in PokemonController.healthCheck:', error);
      return res.status(500).json(
        errorResponse(
          'Health check failed',
          'HEALTH_CHECK_ERROR'
        )
      );
    }
  };
}