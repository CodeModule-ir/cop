import { PoolClient } from 'pg';
import { User } from '../../types/database/TablesTypes';
import { DatabaseService } from '../service/Database';
export class UserService {
  private _db: DatabaseService;
  constructor(_client: PoolClient) {
    this._db = new DatabaseService(_client);
  }
  async create(user: Omit<User, 'id'>): Promise<User> {
    return await this._db.insert<User>('User', {
      telegram_id: user.telegram_id,
      username: user.username,
      first_name: user.first_name,
      created_at: user.created_at || new Date(),
      updated_at: user.updated_at || new Date(),
      role: user.role,
      warnings: user.warnings,
      approved_groups: user.approved_groups,
    });
  }
  async update(user: User): Promise<User | null> {
    const condition = { id: user.id };
    const data = {
      telegram_id: user.telegram_id,
      username: user.username,
      first_name: user.first_name,
      role: user.role,
      warnings: user.warnings,
      approved_groups: user.approved_groups,
      updated_at: new Date(),
    };
    return await this._db.update<User>('User', data, condition);
  }
  async delete(telegram_id: number): Promise<boolean> {
    const deletedUser = await this._db.delete<User>('User', { telegram_id }, ['id']);
    return deletedUser.length > 0;
  }
  async getByTelegramId(telegram_id: number): Promise<User | null> {
    const query = `SELECT * FROM "User" WHERE telegram_id = $1;`;
    const result = await this._db.query<User>(query, [telegram_id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
  async save(user_data: { id: number; username: string; first_name: string }): Promise<User> {
    const { id, username, first_name } = user_data;
    let user = await this.getByTelegramId(id);
    if (!user) {
      const newUserData: Omit<User, 'id'> = {
        created_at: new Date(),
        updated_at: new Date(),
        telegram_id: id,
        role: 'user',
        username: username || null,
        first_name: first_name,
        warnings: 0,
        approved_groups: [],
      };
      user = await this.create(newUserData);
    } else {
      const updatedUserData = {
        ...user,
        username: username,
        first_name: first_name,
        updated_at: new Date(),
      };
      user = await this.update(updatedUserData);
    }
    return user!;
  }
}
