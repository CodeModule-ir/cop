import { Catch } from '../../../decorators/ErrorHandlingDecorator';
import { ConnectionPool } from '../../ConnectionPool';
import * as path from 'path';
import * as fs from 'fs/promises';
export class TablesService {
  constructor(private _connectionPool: ConnectionPool) {}
  @Catch({
    category: 'Database',
    message: 'Failed to set up initial tables.',
    statusCode: 500,
  })
  async initialTables() {
    const client = await this._connectionPool.getClient();
    const sqlFilePath = path.join(__dirname, '..', '..', './sql/Tables.sql');
    const sql = await fs.readFile(sqlFilePath, 'utf-8');
    await client.query(sql);
    console.log('Initial tables have been set up successfully.');
  }
  @Catch({
    category: 'Database',
    message: 'Failed to seed tables.',
    statusCode: 500,
  })
  async seedTables() {
    const client = await this._connectionPool.getClient();
    const result = await client.query(`SELECT COUNT(*) FROM "User";`);
    const userCount = parseInt(result.rows[0].count, 10);
    if (userCount > 0) {
      console.log('The tables have already been seeded. Skipping seeding process.');
      return; // Skip seeding if there's already data in the User table
    }
    const sqlFilePath = path.join(__dirname, '..', '..', './sql/seed/SeedDataTables.sql');
    const sql = await fs.readFile(sqlFilePath, 'utf-8');
    await client.query(sql);
    console.log('All tables have been seeded successfully.');
  }
}
