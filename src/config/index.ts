import { DatabaseConfig } from '../types/ResponseTypes';

class Config {
  private static _instance: Config | null = null;
  public token: string;
  public environment: 'development' | 'production';
  public database: DatabaseConfig;

  private constructor() {
    // Ensure that the token is available in the environment
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('Telegram bot token is missing. Please set TELEGRAM_BOT_TOKEN in the environment.');
    }

    // Set the environment, defaulting to development if not set
    const environment: 'development' | 'production' = process.env.NODE_ENV === 'production' ? 'production' : 'development';

    // Database configuration with environment variables
    const dbUser = process.env.DB_USER!;
    const dbHost = process.env.DB_HOST!;
    const dbName = process.env.DB_NAME!;
    const dbPassword = process.env.DB_PASSWORD!;
    const dbPort = parseInt(process.env.DB_PORT!, 10);
    const dbUrl = process.env.DB_URL!;

    this.token = token;
    this.environment = environment;
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
