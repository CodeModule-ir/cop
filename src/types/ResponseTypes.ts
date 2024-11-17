export interface DatabaseConfig {
  user: string;
  host: string;
  databaseName: string;
  password: string;
  port: number;
  url: string;
  serverUrl: string;
}

export interface BotConfig {
  token: string;
  environment: 'development' | 'production';
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
