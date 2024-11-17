import { PoolClient } from 'pg';
import { Warning } from '../../types/database/TablesTypes';
import { DatabaseService } from '../service/Databas';
export class WarningDatabaseService {
  private _db: DatabaseService;
  constructor(private _client: PoolClient) {
    this._db = new DatabaseService(_client);
  }

  // Create a new warning
  async create(warning: Omit<Warning, 'id'>): Promise<Warning> {
    return await this._db.insert<Warning>('Warning', {
      user_id: warning.user_id,
      group_id: warning.group_id,
      reason: warning.reason,
      warned_at: warning.warned_at || new Date(),
    });
  }

  // Update an existing warning (reason)
  async update(warning: Warning): Promise<Warning | null> {
    const updatedWarning = await this._db.update<Warning>(
      'Warning',
      {
        reason: warning.reason,
        warned_at: warning.warned_at || new Date(),
      },
      { id: warning.id }
    );

    return updatedWarning ?? null;
  }

  // Delete a specific warning
  async delete(warningId: number): Promise<boolean> {
    const deletedWarnings = await this._db.delete<Warning>('Warning', { id: warningId });
    return deletedWarnings.length > 0;
  }

  // Fetch a warning by ID
  async getById(warningId: number): Promise<Warning | null> {
    const query = `SELECT * FROM "Warning" WHERE id = $1;`;
    const result = await this._db.query<Warning>(query, [warningId]);
    return result.rows[0] || null;
  }

  // Fetch all warnings for a specific user
  async getByUserId(userId: number): Promise<Warning[]> {
    const query = `
      SELECT * FROM "Warning"
      WHERE user_id = $1
      ORDER BY warned_at DESC;
    `;
    const result = await this._db.query<Warning>(query, [userId]);
    return result.rows;
  }

  // Fetch all warnings for a specific group
  async getByGroupId(groupId: number): Promise<Warning> {
    const query = `
      SELECT * FROM "Warning"
      WHERE group_id = $1
      ORDER BY warned_at DESC;
    `;
    const result = await this._db.query<Warning>(query, [groupId]);
    return result.rows[0];
  }
  async getAll(filter: { groupId?: number; userId?: number } = {}): Promise<Warning[]> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.groupId) {
      conditions.push(`group_id = $${params.length + 1}`);
      params.push(filter.groupId);
    }
    if (filter.userId) {
      conditions.push(`user_id = $${params.length + 1}`);
      params.push(filter.userId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT * FROM "Warning"
      ${whereClause}
      ORDER BY warned_at DESC;
    `;

    const result = await this._db.query<Warning>(query, params);
    return result.rows;
  }

  async save(groupId: number, userId: number, reason: string): Promise<Warning> {
    let warn = await this.getByGroupId(groupId);
    if (!warn) {
      const newGroupData: Omit<Warning, 'id'> = {
        group_id: groupId,
        reason: reason,
        user_id: userId,
        warned_at: new Date(),
      };
      warn = await this.create(newGroupData);
    }
    return warn!;
  }
}
