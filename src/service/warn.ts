import { Repository } from "typeorm";
import { Warning } from "../entities/Warning";
import { User } from "../entities/User";
import { AppDataSource } from "../config/db";
import { Context } from "grammy";
import { banUser } from "./ban";
import { MESSAGE } from "../helper/message";
import { UserService } from "./user";

export class WarnService {
  private userId: number;
  private ctx: Context;
  private userRepo: Repository<User>;
  private warnRepo: Repository<Warning>;

  constructor(ctx: Context, userId: number) {
    this.userId = userId;
    this.ctx = ctx;
    this.userRepo = AppDataSource.getRepository(User);
    this.warnRepo = AppDataSource.getRepository(Warning);
  }

  /**
   * Adds a warning to a user.
   */
  async warn(reason: string) {
    let user = await this.userRepo.findOne({
      where: { telegram_id: this.userId },
      relations: ["warnings"],
    });

    if (!user) {
      user = await new UserService().createUser(this.ctx, this.userId);;
    }
    // Create and save the new warning
    const warning = this.warnRepo.create({
      user,
      reason,
    });
    await this.warnRepo.save(warning);

    // Update user warnings list
    user.warnings.push(warning);
    await this.userRepo.save(user);

    // Check warning count
    const warningCount = await this.warnRepo.count({ where: { user } });
    if (warningCount >= 3) {
      await banUser(this.userId, this.ctx);
      return { warning, banned: true };
    }
    return { warning, banned: false };
  }

  /**
   * Clears all warnings for a user.
   */
  async clear() {
    const user = await this.userRepo.findOne({
      where: { telegram_id: this.userId },
      relations: ["warnings"],
    });

    if (!user) {
      return MESSAGE.NO_WARNINGS();
    }

    await this.warnRepo.remove(user.warnings);
    user.warnings = [];
    await this.userRepo.save(user);

    return MESSAGE.WARN_CLEAR();
  }

  /**
   * Counts the number of warnings for a user.
   */
  async count(): Promise<number> {
    const user = await this.userRepo.findOne({
      where: { telegram_id: this.userId },
      relations: ["warnings"],
    });

    if (!user) {
      return 0;
    }

    return user.warnings.length;
  }
}
