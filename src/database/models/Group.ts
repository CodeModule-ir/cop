import { PoolClient } from 'pg';
import { Group } from '../../types/database/TablesTypes';
import { Context } from 'grammy';
import { MembersService } from '../service/Members';
import { DatabaseService } from '../service/Database';
import { Catch } from '../../decorators/Catch';
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
      members: group.members || [],
      welcome_message: group.welcome_message,
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
      welcome_message: group.welcome_message,
      members: group.members,
      updated_at: group.updated_at || new Date(),
    };
    return await this._db.update<Group>('Group', data, condition);
  }
  async getByGroupId(groupId: number): Promise<Group | null> {
    const query = `SELECT * FROM "Group" WHERE group_id = $1;`;
    const result = await this._db.query<Group>(query, [groupId]);
    return result.rows[0] || null;
  }
  async save(ctx: Context): Promise<Group> {
    const [id, title] = [ctx.chat!.id!, ctx.chat!.title];
    const perrmission = (await ctx.api.getChat(id)).permissions;
    let group = await this.getByGroupId(id);
    const default_welcome_message = `Welcome to ${ctx.chat!.title}\n\nWe are so glad to have you here!. If you have any questions, don't hesitate to ask! 💬\n\nEnjoy your time here!`;
    if (!group) {
      const newGroupData: Omit<Group, 'id'> = {
        joined_at: new Date(),
        updated_at: new Date(),
        group_id: id,
        group_name: title || 'Unnamed Group',
        black_list: [],
        chat_permissions: perrmission || {},
        approved_users: [],
        warnings: [],
        welcome_message: default_welcome_message,
        members: [],
      };
      group = await this.create(newGroupData);
    }
    return group!;
  }
  async updateMembers(groupId: number, newMember: number | string, ctx: Context): Promise<Group> {
    return await new MembersService(this._client).update(groupId, newMember, ctx);
  }
}
