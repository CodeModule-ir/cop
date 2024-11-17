import { PoolClient } from 'pg';
import { Client } from '../../database/Client';
import { ConnectionPool } from '../../database/ConnectionPool';
import { GroupService } from '../../database/models/Group';
import { UserService } from '../../database/models/User';
import { GroupRuleService } from '../../database/models/GroupRule';
import { WarningDatabaseService } from '../../database/models/Warning';

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
    const client = await this.getPoolClint();
    return new GroupService(client);
  }
  async getUserService() {
    const client = await this.getPoolClint();
    return new UserService(client);
  }
  async getRulesService(){
    const client = await this.getPoolClint()
    return new GroupRuleService(client)
  }
  async getWarnsService(){
    const clint = await this.getPoolClint()
    return new WarningDatabaseService(clint)
  }
}
