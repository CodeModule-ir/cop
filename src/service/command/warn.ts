import { Context } from "grammy";
import { BanService } from "./ban";
import { MESSAGE } from "../../helper/message";
import { UserService } from "../db/user";
import { WarningServiceDb } from "../db/user/warning";
import { Logger } from "../../config/logger";
import { SafeExecution } from "../../decorators/SafeExecution";
const logger = new Logger({file:"warnService.log",level:'debug',timestampFormat:'locale',})
export class WarnService {
  private userId: number;
  private ctx: Context;
  private userRepo: UserService;
  private warnRepo: WarningServiceDb;

  constructor(ctx: Context, userId: number) {
    this.userId = userId;
    this.ctx = ctx;
    this.userRepo = new UserService();
    this.warnRepo = new WarningServiceDb();
  }

  /**
   * Adds a warning to a user.
   */
  // @SafeExecution()
  async warn(reason: string = "unknown") {
    let user = await this.userRepo.findByRelations(this.userId, "warnings");
    if (!user) {
      logger.info('User not found, creating new user', 'WARN_SERVICE', { userId: this.userId });
      user = await this.userRepo.createUser(this.ctx, this.userId);
    }
    // Create and save the new warning
    const warning = await this.warnRepo.create({
      user,
      reason,
    });
    await this.warnRepo.save(warning);
    logger.info('Warning added to user', 'WARN_SERVICE', { userId: this.userId, warningId: warning.id });
    // Update user warnings list
    user.warnings.push(warning);
    await this.userRepo.save(user);
    logger.debug('User warnings updated', 'WARN_SERVICE', { userId: this.userId, warningCount: user.warnings.length });

    // Check warning count
    const warningCount = await this.warnRepo.count(user);
    if (warningCount >= 3) {
      logger.warn('User has reached warning limit', 'WARN_SERVICE', { userId: this.userId, warningCount });
      const msg: string = await new BanService(this.ctx, this.userId).ban();
      await this.warnRepo.clear(user.id);
      logger.info('User banned and warnings cleared', 'WARN_SERVICE', { userId: this.userId, message: msg });
      return { warning, banned: true, message: msg };
    }
    return { warning, banned: false, count: warningCount };
  }

  /**
   * Clears all warnings for a user.
   */
  @SafeExecution()
  async clear() {
    logger.debug('Attempting to clear warnings for user', 'WARN_SERVICE', { userId: this.userId });
    const user = await this.userRepo.findByRelations(this.userId, "warnings");
    if (!user) {
      logger.info('No warnings found for user', 'WARN_SERVICE', { userId: this.userId });
      return MESSAGE.NO_WARNINGS();
    }

    await this.warnRepo.clear(user.id);
    user.warnings = [];
    await this.userRepo.save(user);
    logger.info('All warnings cleared for user', 'WARN_SERVICE', { userId: this.userId });

    return MESSAGE.WARN_CLEAR();
  }

  /**
   * Counts the number of warnings for a user.
   */
  @SafeExecution()
  async count(): Promise<number> {
    logger.debug('Counting warnings for user', 'WARN_SERVICE', { userId: this.userId });

    const user = await this.userRepo.findByRelations(this.userId, "warnings");
    if (!user) {
      logger.info('No user found for warning count', 'WARN_SERVICE', { userId: this.userId });
      return 0;
    }

    const warningCount = user.warnings.length;
    logger.debug('Warning count for user', 'WARN_SERVICE', { userId: this.userId, warningCount });

    return warningCount;
  }
}
