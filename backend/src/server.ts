import dotenv from 'dotenv';
import app from './app';
import { syncDatabase } from './models';
import { logger } from './middlewares/requestLogger.middleware';
import { startScheduledTasks } from './scripts/cronScheduler';

// Load environment variables
dotenv.config();

// Get port from environment variables or default to 3000
const PORT = process.env.PORT || 3000;

// Graceful shutdown handler
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, shutting down gracefully');
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
const startServer = async () => {
  try {
    // Sync database
    await syncDatabase();
    
    // Start scheduled tasks
    startScheduledTasks();
    
    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      logger.error(`Server error: ${error.message}`);
      process.exit(1);
    });
  } catch (error: any) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the application
startServer();