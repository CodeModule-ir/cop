import { CopBot } from './bot';
import { ServiceProvider } from './service/database/ServiceProvider';
import logger from './utils/logger';

async function main() {
  const botInstance = CopBot.getInstance();

  try {
    await ServiceProvider.initialize();
    logger.info('Database initialized.');

    await botInstance.initial();
    logger.info('Bot initialized.');
  } catch (err) {
    logger.error('Error during initialization:' + err);
    process.exit(1);
  }

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received. Shutting down...');
    await shutdown(botInstance);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT signal received. Shutting down...');
    await shutdown(botInstance);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:' + reason);
  });

  process.on('uncaughtException', async (err) => {
    logger.error('Uncaught Exception:' + err);
    await shutdown(botInstance, 1);
  });
}

async function shutdown(botInstance: CopBot, exitCode = 0) {
  try {
    const db = ServiceProvider.getInstance();
    await db.close();
    logger.info('Database closed.');
    await botInstance.stop();
  } catch (err) {
    logger.error('Error during shutdown:' + err);
  } finally {
    process.exit(exitCode);
  }
}

main();
