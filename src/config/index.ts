import { ApprovedUser } from "../entities/ApprovedUser";
import { GroupSettings } from "../entities/GroupSettings";
import { User } from "../entities/User";
import { Warning } from "../entities/Warning";
import { EntityType, Environment } from "../types";
const entities: EntityType[] = [User, Warning, GroupSettings, ApprovedUser];
export const config: Record<
  Environment,
  {
    type: string;
    url?: string;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
    entities: EntityType[];
    synchronize: boolean;
    logging: boolean;
  }
> = {
  production: {
    type: "mysql",
    url: process.env.MYSQL_URL,
    entities: entities,
    synchronize: true,
    logging: false,
  },
  development: {
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "test",
    entities: entities,
    synchronize: true,
    logging: false,
  },
};

export const getAppDataSourceConfig = () => {
  const env: Environment =
    (process.env.NODE_ENV as Environment) || "development";
  return config[env];
};
