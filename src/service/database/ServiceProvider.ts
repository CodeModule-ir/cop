import { PoolClient } from 'pg';
import { Client } from '../../database/Client';
import { ConnectionPool } from '../../database/ConnectionPool';
import { GroupService } from '../../database/models/Group';
import { UserService } from '../../database/models/User';
import { GroupRuleService } from '../../database/models/GroupRule';
import { WarningDatabaseService } from '../../database/models/Warning';
import logger from '../../utils/logger';

export class ServiceProvider {
  private static instance: ServiceProvider;
  private _clientInstance: Client;
  private _connectionPool!: ConnectionPool;
  private constructor() {
    this._clientInstance = new Client();
  }

  static async initialize(): Promise<ServiceProvider> {
    if (!ServiceProvider.instance) {
      const instance = new ServiceProvider();
      await instance._clientInstance.initialize();
      instance._connectionPool = instance._clientInstance.getConnectionPool();
      ServiceProvider.instance = instance;
    }
    return ServiceProvider.instance;
  }
  static getInstance() {
    return ServiceProvider.instance;
  }
  getClient(): Client {
    return this._clientInstance;
  }

  getConnectionPool(): ConnectionPool {
    return this._connectionPool;
  }
  async close(): Promise<void> {
    await this._connectionPool.close();
  }
  async getPoolClint(): Promise<PoolClient> {
    return await this._connectionPool.getClient();
  }
  async getGroupService() {
    return await this.retryConnect(async () => {
      const client = await this.getPoolClint();
      return new GroupService(client);
    });
  }
  async getUserService() {
    return await this.retryConnect(async () => {
      const client = await this.getPoolClint();
      return new UserService(client);
    });
  }
  async getRulesService() {
    return await this.retryConnect(async () => {
      const client = await this.getPoolClint();
      return new GroupRuleService(client);
    });
  }
  async getWarnsService() {
    return await this.retryConnect(async () => {
      const clint = await this.getPoolClint();
      return new WarningDatabaseService(clint);
    });
  }
  async healthCheck(): Promise<boolean> {
    try {
      const client = await this.getPoolClint();
      await client.query('SELECT NOW()');
      client.release();
      console.log('Database is healthy.');
      return true;
    } catch (err: any) {
      console.error('Database health check failed:', err.message);
      return false;
    }
  }
  private async retryConnect(fn: Function, retries = 3, delay = 5000) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        logger.error(`Database Retry Attempt ${attempt + 1}: ${error.message}`, 'Database');
        if (attempt < retries - 1) {
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }
    throw new Error('Failed to connect to the database after retries');
  }
}
