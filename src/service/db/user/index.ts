import { Context } from "grammy";
import { DatabaseService } from "..";
import { User } from "../../../entities/User";

export class UserService extends DatabaseService {
  private userRepo = this.getRepo(User);

  async create(userdata: Partial<User>): Promise<User> {
    return this.userRepo.create(userdata);
  }

  async getByTelegramId(telegramId: number) {
    return this.userRepo.findOne({ where: { telegram_id: telegramId } });
  }
  async save(user: User) {
    return this.userRepo.save(user);
  }
  async findByRelations(userId: number, relationship: string) {
    return this.userRepo.findOne({
      where: { telegram_id: userId },
      relations: [relationship],
    });
  }
  async removeUser(id: number) {
    return this.userRepo.delete({ id });
  }
  async createUser(ctx: Context, telegram_id: number) {
    const chatMember = await ctx.getChatMember(telegram_id);
    const role = chatMember.status;
    let user = await this.getByTelegramId(telegram_id);

    if (!user) {
      user = await this.userRepo.create({
        telegram_id,
        role,
        warnings: [],
      });
      await this.userRepo.save(user);
    }

    return user;
  }
}
