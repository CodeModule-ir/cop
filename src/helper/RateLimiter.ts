interface RateLimitEntry {
  lastCommandTime: number;
  commandCount: number;
}

export class RateLimiter {
  private static rateLimits: Map<number, RateLimitEntry> = new Map();
  private static COMMAND_LIMIT = 5; // Max commands allowed
  private static TIME_FRAME = 10000; // Time frame in milliseconds (10 seconds)
  private static CLEANUP_INTERVAL = 60000; // Cleanup interval in milliseconds (1 minute)

  // Initializes the cleanup task
  static initCleanup() {
    setInterval(() => {
      const currentTime = Date.now();
      for (const [userId, entry] of this.rateLimits.entries()) {
        if (currentTime - entry.lastCommandTime > this.TIME_FRAME) {
          this.rateLimits.delete(userId);
        }
      }
    }, this.CLEANUP_INTERVAL);
  }

  // Rate limit checking logic
  static limit(userId: number): boolean {
    const currentTime = Date.now();
    const entry = this.rateLimits.get(userId);

    if (entry) {
      if (currentTime - entry.lastCommandTime > this.TIME_FRAME) {
        // Reset if the time frame has passed
        this.rateLimits.set(userId, {
          lastCommandTime: currentTime,
          commandCount: 1,
        });
        return true;
      }

      if (entry.commandCount < this.COMMAND_LIMIT) {
        // Increment the command count
        entry.commandCount += 1;
        this.rateLimits.set(userId, entry);
        return true;
      } else {
        // Rate limit exceeded, silently return false
        return false;
      }
    } else {
      // First command from the user
      this.rateLimits.set(userId, {
        lastCommandTime: currentTime,
        commandCount: 1,
      });
      return true;
    }
  }
}

// Initialize the cleanup task
RateLimiter.initCleanup();
