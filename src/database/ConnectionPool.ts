import { Pool, PoolClient } from 'pg';
import Config from '../config';
import logger from '../utils/logger';
export class ConnectionPool {
  private _pool: Pool;
  private _isProduction: 'development' | 'production';
  private _isClosed: boolean = false;
  constructor() {
    const connectionString = this.getConnectionString();
    this._isProduction = Config.environment;
    this._pool = this.initializePool(connectionString);
  }
  async connect(): Promise<boolean> {
    let client: PoolClient | null = null;
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
    if (this._isClosed) return;
    this._isClosed = true;
    try {
      await this._pool.end();
      logger.info('Connection pool closed successfully.');
    } catch (err: any) {
      logger.error('Error while closing the connection pool:', err.message);
    }
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
    if (this._isClosed) {
      throw new Error('Cannot reinitialize a closed pool.');
    }

    if (this._pool && !this._pool.ended) {
      logger.warn('Ending the current pool before reinitialization...');
      await this._pool.end();
    }

    const newConnectionString = this.getConnectionString();
    this._pool = this.initializePool(newConnectionString);

    try {
      const testClient = await this._pool.connect();
      testClient.release(); // Ensure the new pool is functional
      logger.info('Connection pool reinitialized successfully.');
    } catch (err: any) {
      logger.error('Failed to reinitialize connection pool:', err.message);
      throw err; // Let the caller handle this failure
    }
  }
}
