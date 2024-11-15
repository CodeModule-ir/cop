import { ConnectionPool } from './ConnectionPool';
import { TablesService } from './service/tables/Tables';
export class Client {
  private _connectionPool: ConnectionPool;
  constructor() {
    this._connectionPool = new ConnectionPool();
  }
  async initialize() {
    await this._connectionPool.connect();
    const tablesService = new TablesService(this._connectionPool);
    console.log('connect database');
    await tablesService.initialTables();
    console.log('Initial Tables');
    await tablesService.seedTables();
    console.log('Initial Seed Tables');
  }
  getConnectionPool(): ConnectionPool {
    return this._connectionPool;
  }
}
