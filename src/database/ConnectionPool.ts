import { Pool, PoolClient } from 'pg';
import Config from '../config';
export class ConnectionPool {
  private _pool: Pool;
  private _isProduction: 'development' | 'production';
  constructor() {
    const connectionString = this.getConnectionString();
    this._isProduction = Config.environment;
    this._pool = this.initializePool(connectionString);
  }
  async connect(): Promise<void> {
    try {
      const client = await this._pool.connect();
      client.release(); // Connection successful
    } catch (error: any) {
      console.error('Database connection error:', error.message);
      if (error.code === '3D000') {
        console.log(`Database does not exist. Creating database ${Config.database.databaseName}...`);
        await this.createDatabase();
        await this.reinitializePool();
        await this._pool.connect();
      } else {
        console.error('Unexpected error connecting to the database:', error);
      }
    }
  }
  private async createDatabase(): Promise<void> {
    const { user, host, password, port, databaseName } = Config.database;
    const client = new Pool({
      user,
      host,
      password,
      port,
      database: 'postgres',
    });
    try {
      await client.query(`CREATE DATABASE "${databaseName}"`);
      console.log(`Database "${databaseName}" created successfully.`);
    } finally {
      await client.end();
    }
  }
  private getConnectionString(): string {
    const { user, host, databaseName, password, port, url } = Config.database;
    return url || `postgresql://${user}:${password}@${host}:${port}/${databaseName}`;
  }
  async getClient(): Promise<PoolClient> {
    return await this._pool.connect();
  }

  async close(): Promise<void> {
    await this._pool.end();
  }
  private initializePool(connectionString: string): Pool {
    return new Pool({
      connectionString,
      ssl: this._isProduction === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      keepAlive: true,
    });
  }
  private async reinitializePool() {
    await this._pool.end(); // Close old connections
    const newConnectionString = this.getConnectionString();
    this._pool = this.initializePool(newConnectionString);
    console.warn('Connection pool reinitialized.');
  }
}
