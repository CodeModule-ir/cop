import { ConnectionPool } from './ConnectionPool';
import * as fs from 'fs/promises';
import * as path from 'path';
export class DatabaseService {
  private _connectionPool: ConnectionPool;

  constructor() {
    this._connectionPool = new ConnectionPool();
  }

  async initialize() {
    await this._connectionPool.connect();
    await this.setupInitialTables();
    await this.seedTables();
  }

  private async setupInitialTables() {
    const client = await this._connectionPool.getClient();
    const sqlFilePath = path.join(__dirname, './tables/Tables.sql');
    const sql = await fs.readFile(sqlFilePath, 'utf-8');
    await client.query(sql);
    console.log('Initial tables have been set up successfully.');
  }
  private async seedTables() {
    const client = await this._connectionPool.getClient();
    // Define the path where seed files are stored
    const sqlFilePath = path.join(__dirname, './seed/SeedDataTables.sql');

    // Get all seed files
    const sql = await fs.readFile(sqlFilePath, 'utf-8');
    await client.query(sql);
    console.log('All tables have been seeded successfully.');
  }
}
