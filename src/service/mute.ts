import { Repository } from "typeorm";
import { Mute } from "../entities/Mute";
import { User } from "../entities/User";
import { AppDataSource } from "../config/db";
import { Context } from "grammy";
import { MESSAGE } from "../helper/message";
import { UserService } from "./user";

export class MuteService {
  private userId: number;
  private ctx: Context;
  private userRepo: Repository<User>;
  private muteRepo: Repository<Mute>;

  constructor(ctx: Context, userId: number) {
    this.userId = userId;
    this.ctx = ctx;
    this.userRepo = AppDataSource.getRepository(User);
    this.muteRepo = AppDataSource.getRepository(Mute);
  }

  /**
   * Mutes a user with an optional expiration time.
   */
  async mute(expiration?: Date) {
    let user = await this.userRepo.findOne({
      where: { telegram_id: this.userId },
      relations: ["mutes"],
    });
    if (!user) {
      user = await new UserService().createUser(this.ctx, this.userId);
    }
    // Create and save the new mute
    const mute = this.muteRepo.create({
      user,
      muted_at: new Date(),
      mute_expires_at: expiration ?? null,
    });
    await this.muteRepo.save(mute);
    // Update user mutes list
    user.mutes.push(mute);
    await this.userRepo.save(user);

    // Restrict user based on mute settings
    await this.isMute(false);

    if (expiration) {
      // Set a timeout to lift restrictions after the expiration
      const muteDuration = expiration.getTime() - new Date().getTime();
      setTimeout(async () => {
        await this.unmute();
      }, muteDuration);
    }
    return MESSAGE.MUTE_SET(user, expiration);
  }
  /**
   * Applies mute restrictions to the user.
   */
  private async isMute(status: boolean = true) {
    await this.ctx.restrictChatMember(this.userId, {
      can_send_messages: status,
      can_send_photos: status,
      can_send_other_messages: status,
      can_add_web_page_previews: status,
      can_send_audios: status,
    });
  }
  /**
   * Lifts the mute restrictions.
   */
  async unmute() {
    const user = await this.userRepo.findOne({
      where: { telegram_id: this.userId },
      relations: ["mutes"],
    });
    if (!user) {
      return MESSAGE.NO_MUTES();
    }
    await this.isMute(true);
    await this.muteRepo.remove(user?.mutes);
    user.mutes = [];
    await this.userRepo.save(user);
    return MESSAGE.MUTE_CLEAR(this.ctx.message?.reply_to_message?.from!);
  }
}
