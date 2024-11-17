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
    console.log('Setting up initial tables...');
    await tablesService.initialTables();
    console.log('Initial Tables Setup Completed.');

    console.log('Seeding tables...');
    await tablesService.seedTables();
    console.log('Tables seeded successfully.');
  }
  getConnectionPool(): ConnectionPool {
    return this._connectionPool;
  }
}
