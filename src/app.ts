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
    process.exit(1);
  }
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received. Closing bot...');
    try {
      const db = ServiceProvider.getInstance();
      await db.close();
      logger.info('Database closed.');
      await cop.stop();
      logger.info('Bot stopped.');
    } catch (error: any) {
      logger.error('Error during shutdown:', error);
    } finally {
      logger.info('Shutting down bot process');
      process.exit(0);
    }
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  process.on('uncaughtException', async (error: any) => {
    logger.error('Uncaught Exception:', error);
    try {
      const db = ServiceProvider.getInstance();
      await db.close();
      logger.info('Database closed due to uncaught exception.');
    } catch (shutdownError: any) {
      logger.error('Error during shutdown:', shutdownError);
    } finally {
      process.exit(1);
    }
  });
}

main().catch((error) => {
  logger.error('Application error during startup:', error);
  process.exit(1); // Exit if the main function fails
});
