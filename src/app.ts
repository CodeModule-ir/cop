import { CopBot } from './bot';
import { ServiceProvider } from './service/database/ServiceProvider';
import logger from './utils/logger';
async function main() {
  const cop = CopBot.getInstance();
  await ServiceProvider.initialize();
  logger.info('initialize Database');
  await cop.initial();
  logger.info('initial bot');
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received. Closing bot...');
    try {
      const db = ServiceProvider.getInstance();
      await db.close();
      logger.info('Database closed.');
    } catch (error:any) {
      logger.error('Error during shutdown:', error);
    } finally {
      process.exit(0);
    }
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1); 
  });
}
main().catch((error) => console.error('Application error:', error));
