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
  static async initialize(): Promise<ServiceProvider | null> {
    if (!ServiceProvider.instance) {
      const instance = new ServiceProvider();
      const isInitialized = await instance._clientInstance.initialize();
      if (!isInitialized) {
        logger.error('Failed to initialize client instance. Returning null.');
        return null;
      }
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
    const client = await this._connectionPool.getClient();
    client.on('error', (err: any) => {
      logger.error('Unexpected client error:', err);
      client.release();
    });
    return client;
  }
  async getGroupService() {
    const client = await this.getPoolClint();
    return new GroupService(client);
  }
  async getUserService() {
    const client = await this.getPoolClint();
    return new UserService(client);
  }
  async getRulesService() {
    const client = await this.getPoolClint();
    return new GroupRuleService(client);
  }
  async getWarnsService() {
    const clint = await this.getPoolClint();
    return new WarningDatabaseService(clint);
  }
  async healthCheck(): Promise<boolean> {
    const client = await this.getPoolClint();
    try {
      await client.query('SELECT NOW()');
      client.release();
      logger.info('Database is healthy.');
      return true;
    } catch (err: any) {
      logger.error('Database health check failed:', err.message);
      return false;
    } finally {
      client.release();
    }
  }
}
