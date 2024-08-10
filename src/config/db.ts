import { DataSource } from "typeorm";
import { Warning } from "../entities/Warning";
import { User } from "../entities/User";
import { GroupSettings } from "../entities/GroupSettings";
import { ApprovedUser } from "../entities/ApprovedUser";
export const AppDataSource = new DataSource({
  type: "mysql",
  url: process.env.MYSQL_URL,
  entities: [User, Warning, GroupSettings, ApprovedUser],
  synchronize: true,
});
