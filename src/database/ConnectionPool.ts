import { Pool, PoolClient } from 'pg';
import Config from '../config';
import { Catch } from '../decorators/Catch';
export class ConnectionPool {
  private _pool: Pool;
  private _isProduction: 'development' | 'production';
  constructor() {
    const connectionString = this.getConnectionString();
    this._isProduction = Config.environment;
    this._pool = this.initializePool(connectionString);
  }
  @Catch({
    message: 'Failed to connect to the database. Please check your credentials or network connection.',
    statusCode: 500,
    category: 'ConnectionPool',
  })
  async connect(): Promise<void> {
    try {
      const client = await this._pool.connect();
      client.release(); // Connection successful
    } catch (error: any) {
      console.error('Database connection error:', error.message);
      if (error.code === '3D000') {
        console.log(`Database does not exist. Creating database ${Config.database.databaseName}...`);
        await this.createDatabase();
        await this._pool.end(); // End the current pool connection
        const newConnectionString = this.getConnectionString();
        this._pool = this.initializePool(newConnectionString);
        console.log('Retrying connection after creating the database...');
        await this._pool.connect();
      } else {
        console.error('Unexpected error connecting to the database:', error);
      }
    }
  }
  @Catch({
    message: 'Failed to create the database. Please check the connection or permissions.',
    statusCode: 500,
    category: 'ConnectionPool',
  })
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
    } catch (error: any) {
      console.error('Failed to create database:', error.message);
      throw error; // Re-throw the error for better logging and troubleshooting
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
      connectionTimeoutMillis: 500,
      max: 10,
      idleTimeoutMillis: 500,
    });
  }
}
