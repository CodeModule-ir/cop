import { PoolClient } from 'pg';
import { User } from '../../../types/database/TablesTypes';
import { Context } from 'grammy';
export class UserService {
  constructor(private _client: PoolClient) {}
  async create(user: Omit<User, 'id'>) {
    const query = `
          INSERT INTO "User"(
            telegram_id, username, first_name, role,
            warnings, approved_groups
          )
          VALUES (
            $1, $2, $3, $4, $5, $6
          ) RETURNING  id,telegram_id, username, first_name, role,warnings, approved_groups;`;
    const values = [user.telegram_id, user.username, user.first_name, user.role, user.warnings, user.approved_groups];
    const result = await this._client.query(query, values);
    return result.rows[0];
  }
  async update() {}
  async delete() {}
  async getByTelegramId(telegram_id: number): Promise<User | null> {
    const query = `SELECT * FROM "User" WHERE telegram_id = $1;`;
    const result = await this._client.query(query, [telegram_id]);
    return result.rows[0] || null;
  }
  async save(ctx: Context): Promise<User> {
    const [id, username, first_name] = [ctx.from?.id!, ctx.from?.username, ctx.from?.first_name!];
    let user = await this.getByTelegramId(id);
    if (!user) {
      const newUserData: Omit<User, 'id'> = {
        telegram_id: id,
        role: 'user',
        username: username || null,
        first_name: first_name,
        warnings: 0,
        approved_groups: [],
      };
      user = await this.create(newUserData);
    }
    return user!;
  }
}
