import { DatabaseConfig } from '../types/ResponseTypes';

class Config {
  private static _instance: Config | null = null;
  public token: string;
  public environment: 'development' | 'production';
  public database: DatabaseConfig;
  public port: number;
  public web_hook: string;

  private constructor() {
    // Ensure that the token is available in the environment
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const web_hook = process.env.WEB_HOOK;
    const port = process.env.PORT;
    const nodeEnv = process.env.NODE_ENV || 'development';
    if (!token) {
      throw new Error('Telegram bot token is missing. Please set TELEGRAM_BOT_TOKEN in the environment.');
    }
    if (!web_hook) {
      throw new Error('Web hook URL is missing. Please set WEB_HOOK in the environment.');
    }

    if (!token) {
      throw new Error('Telegram bot token is missing. Please set TELEGRAM_BOT_TOKEN in the environment.');
    }
    // Set the environment, defaulting to development if not set
    const environment: 'development' | 'production' = nodeEnv === 'production' ? 'production' : 'development';

    // Database configuration with environment variables
    const dbUser = process.env.DB_USER!;
    const dbHost = process.env.DB_HOST!;
    const dbName = process.env.DB_NAME!;
    const dbPassword = process.env.DB_PASSWORD!;
    const dbPort = parseInt(process.env.DB_PORT!, 10);
    const dbUrl = environment === 'production' ? process.env.DATABASE_URL! : process.env.DB_URL!;

    // Initialize the config properties
    this.token = token;
    this.environment = environment;
    this.port = Number(port);
    this.web_hook = web_hook;
    // Initialize the database configuration
    this.database = {
      user: dbUser,
      host: dbHost,
      databaseName: dbName,
      password: dbPassword,
      port: dbPort,
      url: dbUrl,
    };
  }

  // Singleton pattern to ensure only one instance of the Config class
  public static getInstance(): Config {
    if (!Config._instance) {
      Config._instance = new Config();
    }
    return Config._instance;
  }
}

export default Config.getInstance();
