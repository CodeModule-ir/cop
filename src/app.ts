import { CopBot } from './bot';
import { ServiceProvider } from './service/database/ServiceProvider';
import logger from './utils/logger';

async function main() {
  const botInstance = CopBot.getInstance();

  try {
    const isInitialDatabase = await ServiceProvider.initialize();
    if (!isInitialDatabase) {
      logger.error('Failed to initialize the database after several attempts.');
      process.exit(1);
    }
    logger.info('Database initialized.');

    await botInstance.initial();
    logger.info('Bot initialized.');
  } catch (err: any) {
    logger.error('Error during initialization:', err);
    process.exit(1);
  }

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.warn('SIGTERM signal received. Shutting down...');
    await shutdown(botInstance);
  });

  process.on('SIGINT', async () => {
    logger.warn('SIGINT signal received. Shutting down...');
    await shutdown(botInstance);
  });

  process.on('unhandledRejection', async (reason) => {
    logger.error(`${reason}:`, 'Unhandled Rejection');
    await shutdown(botInstance);
  });

  process.on('uncaughtException', async (err: any) => {
    logger.error(`${err}:`, 'Uncaught Exception');
    await shutdown(botInstance, 1);
  });
}

async function shutdown(botInstance: CopBot, exitCode = 0) {
  try {
    const db = ServiceProvider.getInstance();
    await db.close();
    logger.warn('Database closed.');
    await botInstance.stop();
  } catch (err) {
    console.error('Error during shutdown:', err);
  } finally {
    process.exit(exitCode);
  }
}

main();
