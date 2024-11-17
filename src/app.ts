import { CopBot } from './bot';
import { ServiceProvider } from './service/database/ServiceProvider';
import logger from './utils/logger';
async function main() {
  const cop = CopBot.getInstance();
  await ServiceProvider.initialize();
  logger.info('initialize Database');
  await cop.initial();
  logger.info('initial bot');
}
main();
