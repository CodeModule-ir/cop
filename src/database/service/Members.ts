import { PoolClient } from 'pg';
import { Group } from '../../types/database/TablesTypes'; // Adjust this import based on your actual types
import { GroupService } from '../models/Group';
import { DatabaseService } from './Databas';

export class MembersService {
  private group_by_id: Function;
  private _db: DatabaseService;
  constructor(private _client: PoolClient) {
    const groupService = new GroupService(_client);
    this.group_by_id = groupService.getByGroupId;
    this._db = new DatabaseService(_client);
  }
  async update(groupId: number, newMember: number | string): Promise<Group> {
    const group = await this.group_by_id(groupId);
    if (!group) {
      throw new Error(`Group with ID ${groupId} not found`);
    }

    // Convert newMember to a number and ensure it's a valid member
    const memberId = Number(newMember);
    if (isNaN(memberId)) {
      throw new Error('Invalid member ID');
    }

    const members = group.members.map(Number);
    if (!members.includes(memberId)) {
      members.push(memberId);
    }
    const updatedGroup = await this._db.update<Group>('Group', { members: members }, { group_id: groupId });
    return updatedGroup;
  }

  // Add a new member to the group
  async add(groupId: number, newMember: number | string): Promise<Group> {
    const group = await this.group_by_id(groupId);
    if (!group) {
      throw new Error(`Group with ID ${groupId} not found`);
    }

    // Ensure the new member ID is valid
    const memberId = Number(newMember);
    if (isNaN(memberId)) {
      throw new Error('Invalid member ID');
    }

    // Check if the member is already in the group
    if (group.members.includes(memberId)) {
      throw new Error('Member already exists in the group');
    }

    // Add the new member
    const updatedMembers = [...group.members, memberId];

    const query = `
      UPDATE "Group"
      SET members = $1, updated_at = NOW()
      WHERE group_id = $2
      RETURNING *;
    `;
    const values = [updatedMembers, groupId];
    const result = await this._client.query(query, values);

    // Return the updated group
    return result.rows[0];
  }
}
