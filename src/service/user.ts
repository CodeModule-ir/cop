import { Repository } from "typeorm";
import { User } from "../entities/User";
import { AppDataSource } from "../config/db";
import { Context } from "grammy";

export class UserService {
  private userRepo: Repository<User>;

  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
  }

  async createUser(ctx: Context, telegram_id: number) {
    const chatMember = await ctx.getChatMember(telegram_id);
    const role = chatMember.status;
    const username = ctx.message?.reply_to_message?.from?.username ?? "";
    const first_name = ctx.message?.reply_to_message?.from?.first_name ?? "";
    let user = await this.userRepo.findOne({ where: { telegram_id } });

    if (!user) {
      user = this.userRepo.create({
        telegram_id,
        username,
        first_name,
        role,
        warnings: [],
        mutes: [],
      });
      await this.userRepo.save(user);
    }

    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepo.findOne({ where: { id } });
  }
}
