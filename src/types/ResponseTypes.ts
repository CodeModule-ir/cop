export interface DatabaseConfig {
  user: string;
  host: string;
  databaseName: string;
  password: string;
  port: number;
  url: string;
}

export interface BotConfig {
  token: string;
  environment: 'development' | 'production';
  port: number;
  database: DatabaseConfig;
}
export interface ErrorResponse {
  message: string;
  statusCode: number;
  category: string;
}
export interface RateLimitEntry {
  lastCommandTime: number;
  commandCount: number;
}
