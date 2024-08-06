import { Context } from "grammy";
import { BanService } from "./ban";
import { MESSAGE } from "../../helper/message";
import { UserService } from "../db/user";
import { WarningServiceDb } from "../db/user/warning";

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
  async warn(reason: string = "unknown") {
    let user = await this.userRepo.findByRelations(this.userId, "warning");

    if (!user) {
      user = await this.userRepo.createUser(this.ctx, this.userId);
    }
    // Create and save the new warning
    const warning = await this.warnRepo.create({
      user,
      reason,
    });
    await this.warnRepo.save(warning);

    // Update user warnings list
    user.warnings.push(warning);
    await this.userRepo.save(user);

    // Check warning count
    const warningCount = await this.warnRepo.count(user)
    if (warningCount >= 3) {
      const msg: string = await new BanService(this.ctx, this.userId).ban();
      await this.warnRepo.clear({ user });
      return { warning, banned: true, message: msg };
    }
    return { warning, banned: false, count: warningCount };
  }

  /**
   * Clears all warnings for a user.
   */
  async clear() {
    const user = await this.userRepo.findByRelations(this.userId, "warnings");
    if (!user) {
      return MESSAGE.NO_WARNINGS();
    }

    await this.warnRepo.clear(user.warnings!);
    user.warnings = [];
    await this.userRepo.save(user);

    return MESSAGE.WARN_CLEAR();
  }

  /**
   * Counts the number of warnings for a user.
   */
  async count(): Promise<number> {
    const user = await this.userRepo.findByRelations(this.userId, "warnings");

    if (!user) {
      return 0;
    }

    return user.warnings.length;
  }
}
