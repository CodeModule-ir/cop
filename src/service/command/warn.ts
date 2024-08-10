import { Context } from "grammy";
import { BanService } from "./ban";
import { MESSAGE } from "../../helper/message";
import { UserService } from "../db/user";
import { WarningServiceDb } from "../db/user/warning";
import { SafeExecution } from "../../decorators/SafeExecution";
import { GroupSettingsService } from "../db/group";
export class WarnService {
  private userId: number;
  private ctx: Context;
  private userRepo: UserService;
  private warnRepo: WarningServiceDb;
  private groupRepo: GroupSettingsService
  constructor(ctx: Context, userId: number) {
    this.userId = userId;
    this.ctx = ctx;
    this.userRepo = new UserService();
    this.warnRepo = new WarningServiceDb();
    this.groupRepo = new GroupSettingsService()
  }

  /**
   * Adds a warning to a user.
   */
  // @SafeExecution()
  async warn(reason: string = "unknown") {
    let user = await this.userRepo.findByRelations(
      this.userId,
      "warnings",
    );
    if (!user) {
      user = await this.userRepo.createUser(this.ctx, this.userId);
    }
    const groupId = this.ctx.chat?.id!;

    // Check if user is already a member of the group, if not, add them
    const group = await this.groupRepo.getByGroupId(groupId); 
    if (!group) {
      await this.groupRepo.init(this.ctx)
    }

    // Create and save the new warning
    const warning = this.warnRepo.create({
      user,
      group: group!,
      reason,
    });
    await this.warnRepo.save(warning)
    // Update user warnings list
    user.warnings.push(warning);
    await this.userRepo.save(user);
    // Check warning count
    const warningCount = await this.warnRepo.count(user);
    if (warningCount >= 3) {
      const msg: string = await new BanService(this.ctx, this.userId).ban();
      await this.warnRepo.clear(user.id);
      return { warning, banned: true, message: msg };
    }

    return { warning, banned: false, count: warningCount };
  }

  /**
   * Clears all warnings for a user.
   */
  @SafeExecution()
  async clear() {
    const user = await this.userRepo.findByRelations(this.userId, "warnings");
    if (!user) {
      return MESSAGE.NO_WARNINGS();
    }

    await this.warnRepo.clear(user.id);
    user.warnings = [];
    await this.userRepo.save(user);
    return MESSAGE.WARN_CLEAR();
  }

  /**
   * Counts the number of warnings for a user.
   */
  @SafeExecution()
  async count(): Promise<number> {
    const user = await this.userRepo.findByRelations(this.userId, "warnings");
    if (!user) {
      return 0;
    }

    const warningCount = user.warnings.length;
    return warningCount;
  }
}
