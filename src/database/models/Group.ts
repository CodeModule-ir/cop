import { PoolClient } from 'pg';
import { Group } from '../../types/database/TablesTypes';
import { Context } from 'grammy';
import { MembersService } from '../service/Members';
import { DatabaseService } from '../service/Databas';
export class GroupService {
  private _db: DatabaseService;
  constructor(private _client: PoolClient) {
    this._db = new DatabaseService(_client);
  }
  async create(group: Omit<Group, 'id'>) {
    return await this._db.insert<Group>('Group', {
      group_id: group.group_id,
      group_name: group.group_name,
      black_list: group.black_list || [],
      chat_permissions: JSON.stringify(group.chat_permissions),
      approved_users: group.approved_users || [],
      warnings: group.warnings || [],
      is_spam_time: group.is_spam_time || false,
      members: group.members || [],
      updated_at: group.updated_at || new Date(),
      joined_at: group.joined_at || new Date(),
    });
  }
  async update(group: Group) {
    const condition = { group_id: group.group_id };
    const data = {
      group_id: group.group_id,
      group_name: group.group_name,
      black_list: group.black_list,
      chat_permissions: group.chat_permissions,
      approved_users: group.approved_users,
      warnings: group.warnings,
      is_spam_time: group.is_spam_time,
      members: group.members,
      updated_at: group.updated_at || new Date(),
    };
    return await this._db.update<Group>('Group', data, condition);
  }
  async delete(groupId: number) {}
  async getByGroupId(groupId: number): Promise<Group | null> {
    const query = `SELECT * FROM "Group" WHERE group_id = $1;`;
    const result = await this._db.query<Group>(query, [groupId]);
    return result.rows[0] || null;
  }
  async save(ctx: Context): Promise<Group> {
    const [id, title] = [ctx.chat!.id!, ctx.chat!.title];
    const perrmission = (await ctx.api.getChat(id)).permissions;
    let group = await this.getByGroupId(id);
    if (!group) {
      const newGroupData: Omit<Group, 'id'> = {
        joined_at: new Date(),
        updated_at: new Date(),
        group_id: id,
        group_name: title || 'Unnamed Group',
        black_list: [],
        chat_permissions: perrmission || {},
        approved_users: [],
        warnings: 0,
        is_spam_time: false,
        members: [],
      };
      group = await this.create(newGroupData);
    }
    return group!;
  }
  private getMemebrsService() {
    return new MembersService(this._client);
  }
  async updateMembers(groupId: number, newMember: number | string): Promise<Group> {
    return await this.getMemebrsService().update(groupId, newMember);
  }
}
