import { Router } from 'express';
import { PokemonController } from '../controllers/pokemon.controller';

const router = Router();

export default (controller: PokemonController): Router => {
  // GET /api/pokemon - Search and filter Pokémon
  router.get('/', controller.searchPokemons);

  // POST /api/pokemon/compare - Compare Pokémon stats
  router.post('/compare', controller.comparePokemons);

  // GET /api/pokemon/health - Health check endpoint
  router.get('/health', controller.healthCheck);

  return router;
};