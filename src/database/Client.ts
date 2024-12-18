import logger from '../utils/logger';
import { ConnectionPool } from './ConnectionPool';
import { TablesService } from './service/Tables';
export class Client {
  private _connectionPool: ConnectionPool;
  constructor() {
    this._connectionPool = new ConnectionPool();
  }
  async initialize(): Promise<boolean> {
    try {
      const isConnected = await this._connectionPool.connect();
      if (!isConnected) {
        logger.error('Database connection failed.');
        return false;
      }
      const tablesService = new TablesService(this._connectionPool);
      logger.info('Setting up initial tables...');
      await tablesService.initialTables();
      logger.info('Initial Tables Setup Completed.');

      logger.info('Seeding tables...');
      await tablesService.seedTables();
      logger.info('Tables seeded successfully.');
      return true;
    } catch (error: any) {
      // Log any error that occurs during the initialization process
      logger.error(`Error during database initialization: ${error.message}`);
      return false;
    }
  }
  getConnectionPool(): ConnectionPool {
    return this._connectionPool;
  }
}
