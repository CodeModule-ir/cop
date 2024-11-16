import { Pool, PoolClient } from 'pg';
import Config from '../config';
import { Catch } from '../decorators/Catch';
export class ConnectionPool {
  private _pool: Pool;
  constructor() {
    const connectionString = this.getConnectionString();
    this._pool = new Pool({
      connectionString,
    });
  }
  @Catch({
    message: 'Failed to connect to the database. Please check your credentials or network connection.',
    statusCode: 500,
    category: 'ConnectionPool',
  })
  async connect(): Promise<void> {
    try {
      await this._pool.connect();
    } catch (error: any) {
      console.log('error:', error.code);

      if (error.code === '3D000') {
        console.log(`Database does not exist. Creating database ${Config.database.databaseName}...`);
        await this.createDatabase();
        await this._pool.end(); // End the current pool connection
        const newConnectionString = this.getConnectionString();
        this._pool = new Pool({
          connectionString: newConnectionString,
        });
        await this._pool.connect();
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
    await client.query(`CREATE DATABASE ${databaseName}`);
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
}
