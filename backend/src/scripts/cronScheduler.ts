import cron from 'node-cron';
import { schedulePokemonUpdate } from './improvedPokemonUpdater';
import { logger } from '../middlewares/requestLogger.middleware';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Schedule the Pokémon update to run daily at 2 AM
// Format: second minute hour dayOfMonth month dayOfWeek
const pokemonUpdateTask = cron.schedule('0 0 2 * * *', async () => {
  logger.info('Starting scheduled Pokémon data update...');
  
  try {
    const success = await schedulePokemonUpdate();
    if (success) {
      logger.info('Scheduled Pokémon data update completed successfully');
    } else {
      logger.error('Scheduled Pokémon data update failed');
    }
  } catch (error: any) {
    logger.error(`Error in scheduled Pokémon data update: ${error.message}`);
  }
}, {
  timezone: "UTC"
});

// Schedule cache cleanup to run weekly on Sunday at 3 AM
const cacheCleanupTask = cron.schedule('0 0 3 * * 0', async () => {
  logger.info('Starting weekly cache cleanup...');
  
  try {
    // This would be implemented based on your cache strategy
    logger.info('Weekly cache cleanup completed');
  } catch (error: any) {
    logger.error(`Error in weekly cache cleanup: ${error.message}`);
  }
}, {
  timezone: "UTC"
});

// Function to start all scheduled tasks
export const startScheduledTasks = () => {
  logger.info('Starting scheduled tasks...');
  
  // Start Pokémon update task
  pokemonUpdateTask.start();
  logger.info('Pokémon data update task scheduled for daily at 2 AM UTC');
  
  // Start cache cleanup task
  cacheCleanupTask.start();
  logger.info('Cache cleanup task scheduled for weekly on Sunday at 3 AM UTC');
  
  logger.info('All scheduled tasks started successfully');
};

// Function to stop all scheduled tasks
export const stopScheduledTasks = () => {
  logger.info('Stopping scheduled tasks...');
  
  // Stop all tasks
  pokemonUpdateTask.stop();
  cacheCleanupTask.stop();
  
  logger.info('All scheduled tasks stopped');
};

// Run if called directly
if (require.main === module) {
  logger.info('Starting cron scheduler...');
  startScheduledTasks();
  
  // Keep the process alive
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, stopping scheduled tasks...');
    stopScheduledTasks();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, stopping scheduled tasks...');
    stopScheduledTasks();
    process.exit(0);
  });
}