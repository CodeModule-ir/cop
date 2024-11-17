import { PoolClient } from 'pg';
import { Group } from '../../types/database/TablesTypes';
import { GroupService } from '../models/Group';
import { DatabaseService } from './Databas';
import { Context } from 'grammy';

export class MembersService {
  private _db: DatabaseService;
  private _groupService: GroupService;
  constructor(private _client: PoolClient) {
    this._groupService = new GroupService(_client);
    this._db = new DatabaseService(_client);
  }
  async update(groupId: number, newMember: number | string, ctx: Context): Promise<Group> {
    const groupService = this._groupService;
    let group = await groupService.getByGroupId(groupId);
    if (!group) {
      group = await groupService.save(ctx);
    }
    const memberId = Number(newMember);
    const members = group.members.map(Number);
    if (!members.includes(memberId)) {
      members.push(memberId);
    }
    const updatedGroup = await this._db.update<Group>('Group', { members: members }, { group_id: groupId });
    return updatedGroup;
  }
}
