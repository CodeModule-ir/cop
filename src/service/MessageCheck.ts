import { Context } from "grammy";
import { AppDataSource } from "../config/db";
import { GroupSettings } from "../entities/GroupSettings";
import { Repository } from "typeorm";
import * as BlackListJson from "../helper/black_list.json";
import { MuteService } from "./command/mute";
import { BanService } from "./command/ban";
import { SafeExecution } from "../decorators/SafeExecution";
import { ApprovedUser } from "../entities/ApprovedUser";
import { GroupSettingsService } from "./db/group";
import { Logger } from "../config/logger";
import { UserService } from "./db/user";
import { MESSAGE } from "../helper/message";
import { RateLimiter } from "../helper/RateLimiter";
const logger = new Logger({
  file: "join_group.log",
  level: "info",
  timestampFormat: "locale",
});

export class MessageCheck {
  @SafeExecution()
  private static async getEntities(ctx: Context) {
    if (!ctx.chat) {
      console.error("No ctx.chat found, skipping isNewUser check.");
      return { groupSettings: null, group: null };
    }
    const groupSettings = new GroupSettingsService();
    const groupId = ctx.chat!.id;

    // Fetch the group settings for the current chat
    let group = await groupSettings.getByGroupId(groupId);

    if (!group) {
      await groupSettings.init(ctx);
    }
    return { groupSettings, group };
  }

  @SafeExecution()
  static async isNewUser(ctx: Context) {
    const entity = await MessageCheck.getEntities(ctx);
    const { group, groupSettings } = entity || {};
    if (!group || !groupSettings) {
      return;
    }
    if (ctx.message?.new_chat_members?.length! > 0) {
      const users = ctx.message!.new_chat_members!;

      for (const user of users) {
        if (user.id !== ctx.me?.id) {
          const username = user.username
            ? `@${user.username}`
            : user.first_name;
          if (!group!.members) {
            group!.members = [];
          }
          if (!group!.members.includes(user.id.toString())) {
            group!.members.push(user.id.toString());
          }

          await ctx.reply(
            `Dear ${username}, welcome to ${ctx.chat!.title} chat ❤️`
          );
        }
      }

      // Save the updated group settings
      await groupSettings.save(group!);
    }
  }
  @SafeExecution()
  static async leftGroup(ctx: Context) {
    const entity = await MessageCheck.getEntities(ctx);
    const { group, groupSettings } = entity || {};
    if (!group || !groupSettings) {
      return;
    }
    if (ctx.message?.left_chat_member) {
      const user = ctx.message.left_chat_member!;

      if (user.id !== ctx.me?.id) {
        // Remove the user from the members array
        if (group!.members) {
          group!.members = group!.members.filter(
            (memberId) => memberId !== user.id.toString()
          );
        }
        // Notify the group about the member leaving
        const username = user.username ? `@${user.username}` : user.first_name;
        await ctx.reply(`${username} has left the chat.`);

        await groupSettings.save(group!);
      }
    }
  }

  @SafeExecution()
  static async CheckBlackList(ctx: Context) {
    const groupId = ctx.chat?.id;
    if (!groupId) {
      return;
    }
    const messageText = ctx.message?.text;
    const username = ctx.message?.from?.username || "User";
    const messageId = ctx.message?.message_id;
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
    const approvedUserRepo: Repository<ApprovedUser> =
      AppDataSource.getRepository(ApprovedUser);
    const [isApprovedUser, isAdmin] = await Promise.all([
      approvedUserRepo.findOne({
        where: { user_id: userId, group: { group_id: groupId } },
      }),
      this.isAdmin(ctx, userId),
    ]);
    if (isApprovedUser || isAdmin) {
      return;
    }
    for (const blacklistedTerm of blacklist) {
      if (messageText.includes(blacklistedTerm.toLowerCase())) {
        const blacklistEntry = BlackListJson.find(
          (entry: { term: string; action: string }) =>
            entry.term.toLowerCase() === blacklistedTerm.toLowerCase()
        );

        if (blacklistEntry) {
          await this.executeAction(
            ctx,
            blacklistEntry.action,
            userId,
            username,
            messageId
          );
        } else {
          await this.executeAction(ctx, "mute 1h", userId, username, messageId);
        }
        break;
      }
    }
  }

  @SafeExecution()
  static async isAdmin(ctx: Context, userId: number): Promise<boolean> {
    if (!RateLimiter.limit(ctx.chat!.id)) {
      logger.warn("Rate limit exceeded for getChatAdministrators.");
      return false;
    }
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
    const [muteService, banService] = [
      new MuteService(ctx, userId),
      new BanService(ctx, userId),
    ];

    const [command, duration] = action.split(" ");
    console.log("command:", command);
    switch (command.toLowerCase()) {
      case "ban":
        await banService.ban(false);
        await ctx.api.deleteMessage(ctx.chat?.id!, messageId);
        await ctx.reply(
          `The user @${username} was banned due to the use of vulgar words.`
        );
        break;
      case "mute":
        const expirationDate = await this.calculateMuteDuration(duration);
        await muteService.mute(expirationDate);
        await ctx.api.deleteMessage(ctx.chat?.id!, messageId);
        await ctx.reply(`The user @${username} was muted for ${duration}.`);
        break;
      default:
        const defaultExpiration = await this.calculateMuteDuration("1h");
        console.log(defaultExpiration);

        await muteService.mute(defaultExpiration);
        await ctx.api.deleteMessage(ctx.chat?.id!, messageId);
        await ctx.reply(`The user @${username} was muted for 1 hour.`);
        break;
    }
  }
  @SafeExecution()
  static async calculateMuteDuration(duration: string): Promise<Date> {
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
  @SafeExecution()
  static async initialGroup(ctx: Context) {
    if (!ctx.chat) {
      return;
    }
    const chat = ctx.chat!;
    if (!chat) {
      return;
    }
    const from = ctx.from;
    try {
      const groupRepo = new GroupSettingsService();
      let groupSettings = await groupRepo.getByGroupId(chat.id);
      if (groupSettings) {
        return;
      }

      if (!groupSettings) {
        groupSettings = await groupRepo.init(ctx);
        logger.info(
          `Bot added to group ${chat.title} by ${from?.username}`,
          "GROUP"
        );
      } else {
        logger.info(
          `Bot re-added to existing group ${chat.title} by ${from?.username}`,
          "GROUP"
        );
      }

      // Add the user who added the bot to the group as an admin
      const userRepo = new UserService();
      let user = await userRepo.getByTelegramId(from?.id!);

      if (!user) {
        user = await userRepo.createUser(ctx, from?.id!);
      } else {
        // Update user role if needed
        if (user.role !== "admin") {
          user.role = "admin";
          await userRepo.save(user);
        }
      }
      await ctx.reply(MESSAGE.newGroupJoin(ctx, from?.username!));
    } catch (error: any) {
      logger.error("Failed to save group settings", error, "GROUP");
    }
  }
  static async isCode(ctx: Context) {
    const entities = ctx.message!.entities;
    entities?.forEach((e) => {
      if (e.type === "pre" && e.language) {
        ctx.reply(`Your code is garbage.\n\n- Linus Torvalds`, {
          reply_to_message_id: ctx.message?.message_id,
        });
      }
    });
  }
}
