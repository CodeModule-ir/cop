import { CopBot } from './bot';
import { ServiceProvider } from './service/database/ServiceProvider';
import logger from './utils/logger';
async function main() {
  const cop = CopBot.getInstance();
  const db = await ServiceProvider.initialize();
  logger.info('initialize Database');
  await cop.initial();
  logger.info('initial bot');
  process.on('SIGTERM', async () => {
    await db.close();
    process.exit(0);
  });
}
main().catch((error) => console.error('Application error:', error));
