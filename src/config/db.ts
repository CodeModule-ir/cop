import { DataSource, DataSourceOptions } from "typeorm";
import { getAppDataSourceConfig } from "./index";

const config: DataSourceOptions = getAppDataSourceConfig() as DataSourceOptions;

export const AppDataSource = new DataSource(config);
