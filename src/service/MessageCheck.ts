import { Context } from "grammy";
import { AppDataSource } from "../config/db";
import { GroupSettings } from "../entities/GroupSettings";
import { Repository } from "typeorm";
import * as BlackListJson from "../helper/black_list.json";
import { MuteService } from "./command/mute";
import { BanService } from "./command/ban";
import { SafeExecution } from "../decorators/SafeExecution";

export class MessageCheck {
  @SafeExecution()
  static async CheckBlackList(ctx: Context) {
    const groupId = ctx.chat?.id;
    const messageText = ctx.message?.text;
    const username = ctx.message?.from?.username || "User";
    let messageId = ctx.message?.message_id;
    const userId = ctx.message?.from?.id;
    if (!groupId || !messageText || !userId || !messageId) {
      return;
    }

    const groupRepo: Repository<GroupSettings> =
      AppDataSource.getRepository(GroupSettings);
    const groupSettings = await groupRepo.findOne({
      where: { group_id: groupId },
    });

    if (!groupSettings || !groupSettings.black_list) {
      return;
    }

    const blacklist = groupSettings.black_list;

    for (const blacklistedTerm of blacklist) {
      if (messageText.toLowerCase().includes(blacklistedTerm)) {
        const blacklistEntry = BlackListJson.find(
          (entry: { term: string; action: string }) =>
            entry.term === blacklistedTerm
        );
        // Check if the user is an admin
        const isAdmin = await this.isAdmin(ctx, userId!);
        if (isAdmin && messageText.toLowerCase().includes(blacklistedTerm)) {
          await ctx.api.deleteMessage(ctx.chat?.id!, messageId);
          await ctx.reply(
            `Dear @${username}, as an admin, we expect you to set a good example. Please refrain from using inappropriate language.`
          );
          return;
        }
        if (blacklistEntry) {
          await this.executeAction(ctx, blacklistEntry.action,userId,username,messageId);
        } else {
          await this.executeAction(ctx, "mute 1h", userId, username, messageId);
        }
        break;
      }
    }
  }

  static async isAdmin(ctx: Context, userId: number): Promise<boolean> {
    const chatAdmins = await ctx.getChatAdministrators();
    return chatAdmins.some((admin) => admin.user.id === userId);
  }

  @SafeExecution()
  static async executeAction(
    ctx: Context,
    action: string,
    userId: number,
    username: string,
    messageId: number
  ) {
    const muteService = new MuteService(ctx, userId);
    const banService = new BanService(ctx, userId);

    const [command, duration] = action.split(" ");
    switch (command) {
      case "Ban":
        await banService.ban();
        await ctx.api.deleteMessage(ctx.chat?.id!, messageId);
        await ctx.reply(
          `The user @${username} was banned due to the use of vulgar words.`
        );
        break;
      case "mute":
        const expirationDate = this.calculateMuteDuration(duration);
        await muteService.mute(expirationDate);
        await ctx.api.deleteMessage(ctx.chat?.id!, messageId);
        await ctx.reply(`The user @${username} was muted for ${duration}.`);
        break;
      default:
        const defaultExpiration = this.calculateMuteDuration("1h");
        await muteService.mute(defaultExpiration);
        await ctx.api.deleteMessage(ctx.chat?.id!, messageId);
        await ctx.reply(`The user @${username} was muted for 1 hour.`);
        break;
    }
  }

  static calculateMuteDuration(duration: string): Date {
    const now = new Date();
    const time = parseInt(duration.slice(0, -1), 10);
    const unit = duration.slice(-1);

    switch (unit) {
      case "m":
        now.setMinutes(now.getMinutes() + time);
        break;
      case "h":
        now.setHours(now.getHours() + time);
        break;
      case "d":
        now.setDate(now.getDate() + time);
        break;
      default:
        now.setHours(now.getHours() + 1);
        break;
    }

    return now;
  }
}
