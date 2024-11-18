import { PoolClient, QueryResult, QueryResultRow } from 'pg';
export class DatabaseService {
  constructor(private _client: PoolClient) {}

  /**
   * Runs a query with parameters and returns the result.
   */
  async query<T extends QueryResultRow>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    return await this._client.query<T>(sql, params);
  }

  /**
   * Inserts a new record and returns the inserted row.
   */
  async insert<T extends QueryResultRow>(tableName: string, data: Record<string, any>, returning: string[] = ['*']): Promise<T> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders}) RETURNING ${returning.join(', ')};`;

    const result = await this.query<T>(sql, values);
    return result.rows[0];
  }

  /**
   * Updates a record and returns the updated row.
   */
  async update<T extends QueryResultRow>(tableName: string, data: Record<string, any>, condition: Record<string, any>, returning: string[] = ['*']): Promise<T> {
    const setClauses = Object.keys(data)
      .map((key, i) => `"${key}" = $${i + 1}`)
      .join(', ');
    const whereClauses = Object.keys(condition)
      .map((key, i) => `"${key}" = $${i + Object.keys(data).length + 1}`)
      .join(' AND ');

    const values = [...Object.values(data), ...Object.values(condition)];
    const sql = `UPDATE "${tableName}" SET ${setClauses} WHERE ${whereClauses} RETURNING ${returning.join(', ')};`;
    const result = await this.query<T>(sql, values);
    return result.rows[0];
  }

  /**
   * Deletes records and optionally returns the deleted rows.
   */
  async delete<T extends QueryResultRow>(tableName: string, condition: Record<string, any>, returning: string[] = ['*']): Promise<T[]> {
    const whereClauses = Object.keys(condition)
      .map((key, i) => `"${key}" = $${i + 1}`)
      .join(' AND ');
    const values = Object.values(condition);
    const sql = `DELETE FROM "${tableName}" WHERE ${whereClauses} RETURNING ${returning.join(', ')};`;
    const result = await this.query<T>(sql, values);
    return result.rows;
  }
}
