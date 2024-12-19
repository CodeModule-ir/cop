import { Pool, PoolClient } from 'pg';
import Config from '../config';
import logger from '../utils/logger';
export class ConnectionPool {
  private _pool: Pool;
  private _isProduction: 'development' | 'production';
  constructor() {
    const connectionString = this.getConnectionString();
    this._isProduction = Config.environment;
    this._pool = this.initializePool(connectionString);
  }
  async connect(): Promise<boolean> {
    let client;
    try {
      client = await this._pool.connect();
      logger.info('Database connection successful');
      return true;
    } catch (error: any) {
      console.error('Database connection error:', error.message);

      // Handle missing database error (PostgreSQL code: 3D000)
      if (error.code === '3D000') {
        console.log(`Database does not exist. Creating database ${Config.database.databaseName}...`);

        try {
          await this.createDatabase();
          await this.reinitializePool();
          client = await this._pool.connect(); // Retry connection
          logger.info('Database connection successful after reinitialization');
          return true;
        } catch (reconnectError: any) {
          console.error('Reconnection failed after reinitialization:', reconnectError.message);
          return false;
        }
      } else {
        console.error('Unexpected error connecting to the database:', error);
        return false;
      }
    } finally {
      // Release client only if it was successfully acquired
      if (client) {
        client.release();
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
    await client.query(`CREATE DATABASE "${databaseName}"`);
    console.log(`Database "${databaseName}" created successfully.`);
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
      idleTimeoutMillis: 30000, // Increase idle timeout
      connectionTimeoutMillis: 10000, // Increase connection timeout
      keepAlive: true,
    });
  }
  async reinitializePool() {
    if (this._pool) {
      await this._pool.end();
    }
    const newConnectionString = this.getConnectionString();
    this._pool = this.initializePool(newConnectionString);
    console.warn('Connection pool reinitialized.');
  }
}
