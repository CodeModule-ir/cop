import { Repository } from "typeorm";
import { Context } from "grammy";
import { User } from "../../entities/User";
import { AppDataSource } from "../../config/db";

export class UserService {
  private userRepo: Repository<User>;

  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
  }

  async createUser(ctx: Context, telegram_id: number) {
    const chatMember = await ctx.getChatMember(telegram_id);
    const role = chatMember.status;
    let user = await this.userRepo.findOne({ where: { telegram_id } });

    if (!user) {
      user = this.userRepo.create({
        telegram_id,
        role,
        warnings: [],
      });
      await this.userRepo.save(user);
    }

    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepo.findOne({ where: { id } });
  }
}
