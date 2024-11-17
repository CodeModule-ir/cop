import { CopBot } from './bot';
import { ServiceProvider } from './service/database/ServiceProvider';
import logger from './utils/logger';

async function main() {
  const cop = CopBot.getInstance();
  try {
    await ServiceProvider.initialize();
    logger.info('Initialized Database');

    await cop.initial();
    logger.info('Bot initialized');
  } catch (error: any) {
    logger.error('Error during initialization:', error);
    process.exit(1); // Exit if initialization fails
  }

  // Handle graceful shutdown on SIGTERM
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received. Closing bot...');
    try {
      const db = ServiceProvider.getInstance();
      await db.close(); // Ensure DB is closed before exiting
      logger.info('Database closed.');
    } catch (error: any) {
      logger.error('Error during shutdown:', error);
    } finally {
      logger.info('Shutting down bot process');
      process.exit(0);
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Consider gracefully shutting down the app here if necessary
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error: any) => {
    logger.error('Uncaught Exception:', error);
    try {
      const db = ServiceProvider.getInstance();
      await db.close(); // Close DB before exiting on uncaught exception
      logger.info('Database closed due to uncaught exception.');
    } catch (shutdownError: any) {
      logger.error('Error during shutdown:', shutdownError);
    } finally {
      process.exit(1); // Exit the process on uncaught exception
    }
  });
}

main().catch((error) => {
  logger.error('Application error during startup:', error);
  process.exit(1); // Exit if the main function fails
});
