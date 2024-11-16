import * as path from 'path';
import * as fs from 'fs/promises';
import { ConnectionPool } from '../ConnectionPool';
export class MigrationService {
  private migrationDir: string;

  constructor(private _connectionPool: ConnectionPool) {
    this.migrationDir = path.join(__dirname, '..', 'migrations');
  }

  // Check if the migration has been applied by its name
  async isMigrationApplied(migrationName: string): Promise<boolean> {
    const client = await this._connectionPool.getClient();
    const query = 'SELECT COUNT(*) FROM "Migration" WHERE name = $1';
    const result = await client.query(query, [migrationName]);
    return parseInt(result.rows[0].count, 10) > 0;
  }

  // Mark the migration as applied
  async markMigrationAsApplied(migrationName: string): Promise<void> {
    const client = await this._connectionPool.getClient();
    const query = 'INSERT INTO "Migration" (name) VALUES ($1)';
    await client.query(query, [migrationName]);
  }

  // Apply the migration files in sequence
  async applyMigrations() {
    const migrationFiles = await fs.readdir(this.migrationDir);
    // Sort files by filename to apply them in order (e.g., 001, 002, etc.)
    const sortedMigrationFiles = migrationFiles.sort();

    for (const migrationFile of sortedMigrationFiles) {
      const migrationName = migrationFile.split('.')[0];

      // Check if the migration has already been applied
      const isApplied = await this.isMigrationApplied(migrationName);
      if (!isApplied) {
        const filePath = path.join(this.migrationDir, migrationFile);
        const migrationSQL = await fs.readFile(filePath, 'utf-8');

        const client = await this._connectionPool.getClient();
        await client.query(migrationSQL);

        // Mark the migration as applied
        await this.markMigrationAsApplied(migrationName);
        console.log(`Migration ${migrationName} applied successfully.`);
      } else {
        console.log(`Migration ${migrationName} has already been applied.`);
      }
    }
  }
}
