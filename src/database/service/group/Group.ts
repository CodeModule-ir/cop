import { PoolClient } from 'pg';
import { Group, User } from '../../../types/database/TablesTypes';
import { Context } from 'grammy';
export class GroupService {
  constructor(private _client: PoolClient) {}
  async create(group: Omit<Group, 'id'>) {
    const query = `
      INSERT INTO "Group" (
        group_id, group_name, rules, black_list,
        chat_permissions, updated_at, joined_at, approved_users,
        warnings, is_spam_time,members
      )
      VALUES (
        $1, $2, $3, $4, $5, NOW(), NOW(), $6, $7, $8, $9
      ) RETURNING id,group_id, group_name, rules, black_list,chat_permissions, updated_at, joined_at, approved_users,warnings, is_spam_time,members;
    `;
    const values = [
      group.group_id,
      group.group_name,
      group.rules || [],
      group.black_list || [],
      JSON.stringify(group.chat_permissions),
      group.approved_users || [],
      group.warnings || [],
      group.is_spam_time || false,
      group.members || [],
    ];
    const result = await this._client.query(query, values);
    return result.rows[0];
  }
  async update(group: Group) {
    const query = `
    UPDATE "Group"
    SET 
      group_name = $1,
      rules = $2,
      black_list = $3,
      chat_permissions = $4,
      updated_at = NOW(),
      approved_users = $5,
      warnings = $6,
      is_spam_time = $7,
      members = $8
    WHERE group_id = $9
    RETURNING id, group_id, group_name, rules, black_list, chat_permissions, updated_at, approved_users, warnings, is_spam_time, members;
  `;

    const values = [group.group_name, group.rules, group.black_list, JSON.stringify(group.chat_permissions), group.approved_users, group.warnings, group.is_spam_time, group.members, group.group_id];

    const result = await this._client.query(query, values);
    return result.rows[0];
  }

  async delete() {}
  async getByGroupId(groupId: number): Promise<Group | null> {
    const query = `SELECT * FROM "Group" WHERE group_id = $1;`;
    const result = await this._client.query(query, [groupId]);
    return result.rows[0] || null;
  }
  async save(ctx: Context): Promise<Group> {
    const [id, title] = [ctx.chat!.id!, ctx.chat!.title];
    let group = await this.getByGroupId(id);
    if (!group) {
      const newGroupData: Omit<Group, 'id'> = {
        group_id: id,
        group_name: title || 'Unnamed Group',
        rules: [],
        black_list: [],
        chat_permissions: {},
        approved_users: [],
        warnings: 0,
        is_spam_time: false,
        members: [],
      };
      group = await this.create(newGroupData);
    }
    return group!;
  }
  async addRule(groupId: number, newRule: string): Promise<void> {
    const group = await this.getByGroupId(groupId);
    if (!group) {
      throw new Error(`Group with ID ${groupId} not found.`);
    }

    const updatedRules = [...group.rules, newRule]; // Add the new rule
    await this.update({ ...group, rules: updatedRules });
  }
  async getRules(groupId: number): Promise<string[]> {
    const query = `SELECT rules FROM "Group" WHERE group_id = $1;`;
    const result = await this._client.query(query, [groupId]);
    return result.rows[0]?.rules || [];
  }
  async updateMembers(groupId: number, newMember: number | string) {
    const group = await this.getByGroupId(groupId);
    if (!group) {
      throw new Error(`Group with ID ${groupId} not found`);
    }
    const members = group.members.map(Number);
    if (!members.includes(+newMember)) {
      members.push(+newMember);
    }
    const updatedGroup = await this.update({
      ...group,
      members,
    });

    return updatedGroup;
  }
  async deleteLastRule(groupId: number): Promise<string[] | null> {
    const group = await this.getByGroupId(groupId);
    if (!group || group.rules.length === 0) {
      return null; // No rules to delete
    }

    const updatedRules = group.rules.slice(0, -1); // Remove the last rule
    await this.update({ ...group, rules: updatedRules });
    return updatedRules;
  }
  async clearRules(groupId: number): Promise<void> {
    const group = await this.getByGroupId(groupId);
    if (!group) {
      throw new Error(`Group with ID ${groupId} not found.`);
    }

    await this.update({ ...group, rules: [] }); // Clear all rules
  }
}
