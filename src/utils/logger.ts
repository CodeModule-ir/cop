import { Logger } from '@medishn/logger';

class Log {
  private logger: Logger;

  constructor() {
    // Initialize the logger with the specified configuration
    this.logger = new Logger({
      transports: ['console'],
    });
  }

  // Warn method to log warnings
  warn(message: string, category?: string) {
    this.logger.log({ message, category, level: 'warn' });
  }

  // Error method to log errors
  error(message: string, category?: string) {
    this.logger.log({ message, category, level: 'error' });
  }

  // Info method to log informational messages
  info(message: string, category?: string) {
    this.logger.log({ message, category, level: 'info' });
  }

  // Debug method to log debugging messages
  debug(message: string, category?: string) {
    this.logger.log({ message, category, level: 'debug' });
  }
}

export default new Log();
