import { CopBot } from './bot';
import { DatabaseService } from './database';
import logger from './utils/logger';
async function main() {
  const cop = new CopBot();
  await new DatabaseService().initialize();
  logger.info('initialize Database');
  await cop.initial();
  logger.info('initial bot');
}
main();
