import { PoolClient } from 'pg';
import { Client } from '../../database/Client';
import { ConnectionPool } from '../../database/ConnectionPool';
import { GroupService } from '../../database/service/group/Group';
import { UserService } from '../../database/service/user/User';

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
    const clint = await this.getPoolClint();
    return new GroupService(clint);
  }
  async getUserService() {
    const clint = await this.getPoolClint();
    return new UserService(clint);
  }
}
