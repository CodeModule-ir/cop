import { Logger } from '@medishn/toolkit';

class Log {
  private logger: Logger;

  constructor() {
    // Initialize the logger with the specified configuration
    this.logger = new Logger({
      context: 'console',
      logLevels: ['warn', 'error', 'info', 'debug'],
    });
  }

  // Warn method to log warnings
  warn(message: string, category?: string) {
    this.logger.warn({ message, category });
  }

  // Error method to log errors
  error(message: string, category?: string) {
    this.logger.error({ message, category });
  }

  // Info method to log informational messages
  info(message: string, category?: string) {
    this.logger.info({ message, category });
  }

  // Debug method to log debugging messages
  debug(message: string, category?: string) {
    this.logger.debug({ message, category });
  }
}

export default new Log();
