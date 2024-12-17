import logger from '../utils/logger';
import { ConnectionPool } from './ConnectionPool';
import { TablesService } from './service/Tables';
export class Client {
  private _connectionPool: ConnectionPool;
  constructor() {
    this._connectionPool = new ConnectionPool();
  }
  async initialize() {
    await this._connectionPool.connect();
    const tablesService = new TablesService(this._connectionPool);
    logger.info('Setting up initial tables...');
    await tablesService.initialTables();
    logger.info('Initial Tables Setup Completed.');

    logger.info('Seeding tables...');
    await tablesService.seedTables();
    logger.info('Tables seeded successfully.');
  }
  getConnectionPool(): ConnectionPool {
    return this._connectionPool;
  }
}
