import { DataSource } from "typeorm";
import { Warning } from "../entities/Warning";
import { User } from "../entities/User";
import { Role } from "../entities/Role";
import { GroupSettings } from "../entities/GroupSettings";
export const AppDataSource = new DataSource({
  type: "mariadb",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Warning, User, Role,GroupSettings],
  synchronize: true,
});
