import { DataSource, ObjectLiteral, Repository } from "typeorm";
import { AppDataSource } from "../../config/db";
import { logger } from "../../config/logger";
export class DatabaseService {
  protected db: DataSource;

  constructor() {
    this.db = AppDataSource;
  }

  protected getRepo<T extends ObjectLiteral>(entity: {
    new (): T;
  }): Repository<T> {
    return this.db.getRepository(entity);
  }

  async initialize() {
    try {
      await this.db.initialize();
      logger.info("Database connection initialized", "DATABASE");
    } catch (error: any) {
      logger.error("Error initializing database connection", error, "DATABASE");
    }
  }

  async close() {
    await this.db.destroy();
    logger.info("Database connection closed");
  }
}
export const db = new DatabaseService();
