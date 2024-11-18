import { RateLimitEntry } from '../types/ResponseTypes';

export class RateLimiter {
  private static rateLimits: Map<number, RateLimitEntry> = new Map();
  private static CLEANUP_INTERVAL = 60000;

  private commandLimit: number;
  private timeFrame: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(commandLimit = 5, timeFrame = 10000) {
    this.commandLimit = commandLimit;
    this.timeFrame = timeFrame;
    this.startCleanupTask();
  }

  /**
   * Starts the periodic cleanup task to remove stale entries.
   * Stale entries are those where the time since the last command exceeds the time frame.
   */
  private startCleanupTask() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval); // Prevent multiple intervals
    }

    this.cleanupInterval = setInterval(() => {
      const currentTime = Date.now();
      for (const [userId, entry] of RateLimiter.rateLimits.entries()) {
        if (currentTime - entry.lastCommandTime > this.timeFrame) {
          RateLimiter.rateLimits.delete(userId);
        }
      }
    }, RateLimiter.CLEANUP_INTERVAL);
  }
  /**
   * Stops the cleanup task.
   * Should be called if the RateLimiter instance is no longer needed.
   */
  public stopCleanupTask() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
  /**
   * Checks if a user is within the rate limit.
   * If the user is allowed, their command count and timestamp are updated.
   *
   * @param userId - The unique ID of the user
   * @returns `true` if the user is within the rate limit; `false` otherwise.
   */
  public checkRateLimit(userId: number): boolean {
    const currentTime = Date.now();
    const entry = RateLimiter.rateLimits.get(userId);

    if (entry) {
      if (currentTime - entry.lastCommandTime > this.timeFrame) {
        // Reset the count if the time frame has passed
        RateLimiter.rateLimits.set(userId, {
          lastCommandTime: currentTime,
          commandCount: 1,
        });
        return true;
      }

      if (entry.commandCount < this.commandLimit) {
        // Increment the command count
        entry.commandCount += 1;
        entry.lastCommandTime = currentTime;
        RateLimiter.rateLimits.set(userId, entry);
        return true;
      } else {
        // Rate limit exceeded
        return false;
      }
    } else {
      // First command from the user
      RateLimiter.rateLimits.set(userId, {
        lastCommandTime: currentTime,
        commandCount: 1,
      });
      return true;
    }
  }
}
