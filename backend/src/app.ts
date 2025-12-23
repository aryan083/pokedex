import express from 'express';
import cors from 'cors';
import './config/env';
import path from 'path';
import { httpLogger } from './middlewares/requestLogger.middleware';
import { errorHandler } from './middlewares/error.middleware';
import pokemonRoutes from './routes/pokemon.routes';
import { PokemonController } from './controllers/pokemon.controller';
import { PokemonService } from './services/pokemon.service';
import { PokemonRepositoryImpl } from './repositories/pokemon.repository';
import { SearchService } from './services/search.service';
import { RedisCache } from './cache/redisCache';
import { logger } from './middlewares/requestLogger.middleware';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(httpLogger);

// Initialize services
const redisCache = new RedisCache(logger);
const pokemonRepository = new PokemonRepositoryImpl();
const searchService = new SearchService(redisCache);
const pokemonService = new PokemonService(pokemonRepository, searchService, redisCache);
const pokemonController = new PokemonController(pokemonService);

// Routes
app.use('/api/pokemon', pokemonRoutes(pokemonController));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'PokéDex API is running!',
    version: '1.0.0',
    documentation: '/api/pokemon'
  });
});

// Temporary seed endpoint (remove after seeding)
app.post('/seed', async (req, res) => {
  try {
    // Import the seed function dynamically
    const { seedDatabase } = await import('./scripts/fetchAndSeed');
    await seedDatabase(10000); // Seed all available Pokémon
    res.json({ message: 'Seeding completed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Seeding failed', details: (error as Error).message });
  }
});

// Update database endpoint
app.post('/update-database', async (req, res) => {
  try {
    // Import the seed function dynamically
    const { seedDatabase } = await import('./scripts/fetchAndSeed');
    
    // Get limit from request body or default to 10000
    const limit = req.body.limit || 10000;
    
    logger.info(`Starting database update with limit: ${limit}`);
    await seedDatabase(limit);
    
    res.json({ 
      message: 'Database update completed successfully',
      updatedPokemonCount: limit
    });
  } catch (error: any) {
    logger.error(`Database update failed: ${error.message}`);
    res.status(500).json({ 
      error: 'Database update failed', 
      details: error.message 
    });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Serve Pokémon images
app.use('/images/sprites', express.static(path.join(__dirname, '../images/sprites')));
app.use('/images/artwork', express.static(path.join(__dirname, '../images/artwork')));

app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

export default app;