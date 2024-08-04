import { Context } from "grammy";
import { MESSAGE } from "../helper/message";
import { SafeExecution } from "../decorators/SafeExecution";
import { MuteService } from "../service/command/mute";
import { parseDuration } from "../helper";
import { ChatPermissions } from "grammy/types";
import { WarnService } from "../service/command/warn";
import { BanService } from "../service/command/ban";
import { BotOverseer } from "../service/bot";
import { BlacklistService } from "../service/command/blacklist";
import { DateCommand } from "../service/command/date";
import { Rules } from '../service/command/rules';
import { Approved } from "../service/command/approved";
export class AdminCommand {
  @SafeExecution()
  static async Warn(ctx: Context): Promise<void> {
    const bot = new BotOverseer(ctx);
    const [repliedMessage, repliedUserId] = await Promise.all([
      bot.getReplyMessage(),
      bot.getRepliedUserId(),
    ]);
    const reason: string = String(ctx.match);
    const username = repliedMessage?.from?.username;
    if (repliedUserId && username) {
      const result = await new WarnService(ctx, repliedUserId).warn(reason);
      if (result.banned) {
        await ctx.reply(
          "User has been banned for reaching the maximum warnings.",
          {
            reply_to_message_id: ctx.message?.message_id,
          }
        );
      } else if (result.warning) {
        await ctx.reply(MESSAGE.WARN(repliedMessage, result.count!, reason), {
          reply_to_message_id: ctx.message?.message_id,
        });
      }
    }
  }

  @SafeExecution()
  static async WarnClear(ctx: Context): Promise<void> {
    const bot = new BotOverseer(ctx);
    const userId = await bot.getRepliedUserId();
    const responseMessage = await new WarnService(ctx, userId!).clear();
    await ctx.reply(responseMessage, {
      reply_to_message_id: ctx.message?.message_id,
    });
  }

  @SafeExecution()
  static async mute(ctx: Context): Promise<void> {
    const bot = new BotOverseer(ctx);
    const userId = await bot.getRepliedUserId();
    const durationStr = String(ctx.match as string)
      .trim()
      .split(" ")[1];
    let durationMs: number | null = null;
    if (durationStr) {
      durationMs = parseDuration(durationStr);
    }

    // Set expiration date
    const expiration = durationMs ? new Date(Date.now() + durationMs) : null;
    // Create a new instance of MuteService and apply mute
    const result = await new MuteService(ctx, userId!).mute(expiration);
    await ctx.reply(result, {
      reply_to_message_id: ctx.message?.message_id,
    });
  }
  @SafeExecution()
  static async MuteClear(ctx: Context): Promise<void> {
    const bot = new BotOverseer(ctx);
    const userId = await bot.getRepliedUserId();
    const responseMessage = await new MuteService(ctx, userId!).unmute();
    await ctx.reply(responseMessage!, {
      reply_to_message_id: ctx.message?.message_id,
    });
  }

  @SafeExecution()
  static async ban(ctx: Context): Promise<void> {
    const bot = new BotOverseer(ctx);
    const userId = await bot.getRepliedUserId();
    const responseMessage = await new BanService(ctx, userId!).ban();
    await ctx.reply(responseMessage, {
      reply_to_message_id: ctx.message?.message_id,
    });
  }
  @SafeExecution()
  static async unBan(ctx: Context): Promise<void> {
    const bot = new BotOverseer(ctx);
    const userId = await bot.getRepliedUserId();
    const responseMessage = await new BanService(ctx, userId!).unban();
    await ctx.reply(responseMessage, {
      reply_to_message_id: ctx.message?.message_id,
    });
  }
  @SafeExecution()
  static async Purge(ctx: Context): Promise<any> {
    const chatId = ctx.chat?.id;
    const replyToMessageId = ctx.message?.reply_to_message?.message_id;
    if (!chatId || !replyToMessageId) {
      return ctx.reply("Please reply to a message and use the /purge command.");
    }
    let lastMessageId = ctx.message?.message_id;
    if (!lastMessageId) {
      return ctx.reply("No message ID found.");
    }
    // Calculate the number of messages to delete
    const countMessages = lastMessageId - replyToMessageId;

    if (countMessages <= 0) {
      return ctx.reply(
        "The reply-to message is not older than the current message or no messages to delete."
      );
    }
    // Prepare the array of message IDs to delete
    const messagesToDelete = [];
    for (let i = 0; i <= countMessages; i++) {
      messagesToDelete.push(replyToMessageId + i);
    }

    // Use ctx.deleteMessages to delete the messages
    await ctx.deleteMessages(messagesToDelete);
    await ctx.reply("Deleting done.");
  }

  @SafeExecution()
  static async approved(ctx: Context) {
    await Approved.add(ctx)
  }

  @SafeExecution()
  static async unApproved(ctx: Context) {
    await Approved.remove(ctx)
  }

  @SafeExecution()
  static async lock(ctx: Context) {
    const bot = new BotOverseer(ctx);
    const userId = (await bot.getUser()).id;

    // Check if the user is an admin
    if (!(await bot.isUserAdmin(userId))) {
      return ctx.reply("Only admins can use the /lock command.", {
        reply_to_message_id: ctx.message?.message_id,
      });
    }

    const chatId = ctx.chat?.id;
    const lockType = ctx.message?.text?.split(" ")[1];

    if (!chatId) {
      return ctx.reply("Could not retrieve chat information.");
    }

    // Fetch current chat permissions
    const currentPermissions: ChatPermissions | undefined = await ctx.api
      .getChat(chatId!)
      .then((chat) => chat.permissions);

    let updatedPermissions: ChatPermissions;

    // Determine the type of lock
    if (!lockType) {
      // Lock all permissions if no specific type is provided
      updatedPermissions = {
        can_send_messages: false,
        can_send_polls: false,
        can_send_other_messages: false,
        can_add_web_page_previews: false,
        can_change_info: false,
        can_invite_users: false,
        can_pin_messages: false,
        can_send_photos: false,
        can_send_documents: false,
        can_manage_topics: false,
      };
      await ctx.reply("Locked all permissions for all members.");
    } else {
      // Lock specific types based on the provided lockType
      updatedPermissions = { ...currentPermissions };

      switch (lockType.toLowerCase()) {
        case "sticker":
          updatedPermissions.can_send_other_messages = false;
          break;
        case "forward":
          updatedPermissions.can_send_other_messages = false;
          break;
        case "poll":
          updatedPermissions.can_send_polls = false;
          break;
        default:
          return ctx.reply(
            "Invalid lock type. Available options are: gif, msg, sticker, forward, poll."
          );
      }
      await ctx.reply(`Locked ${lockType} for all members.`);
    }

    await ctx.api.setChatPermissions(chatId, updatedPermissions);
  }
  @SafeExecution()
  static async unLock(ctx: Context) {
    const bot = new BotOverseer(ctx);
    const userId = (await bot.getUser()).id;

    // Check if the user is an admin
    if (!(await bot.isUserAdmin(userId))) {
      return ctx.reply("Only admins can use the /unlock command.", {
        reply_to_message_id: ctx.message?.message_id,
      });
    }

    const chatId = ctx.chat?.id;
    const unlockType = ctx.message?.text?.split(" ")[1];

    if (!chatId) {
      return ctx.reply("Could not retrieve chat information.");
    }

    // Fetch current chat permissions
    const currentPermissions: ChatPermissions | undefined = await ctx.api
      .getChat(chatId!)
      .then((chat) => chat.permissions);

    let updatedPermissions: ChatPermissions = { ...currentPermissions };

    // Determine the type of unlock
    if (!unlockType) {
      // Unlock all permissions if no specific type is provided
      updatedPermissions = {
        can_send_messages: true,
        can_invite_users: true,
        can_send_photos: true,
      };
      await ctx.reply("Unlocked all permissions for all members.");
    } else {
      // Unlock specific types based on the provided unlockType
      switch (unlockType.toLowerCase()) {
        case "sticker":
          updatedPermissions.can_send_other_messages = true;
          break;
        case "gif":
          updatedPermissions.can_send_other_messages = true;
          break;
        case "forward":
          updatedPermissions.can_send_other_messages = true;
          break;
        case "poll":
          updatedPermissions.can_send_polls = true;
          break;
        default:
          return ctx.reply(
            "Invalid unlock type. Available options are: gif, msg, sticker, forward, poll."
          );
      }
      await ctx.reply(`Unlocked ${unlockType} for all members.`);
    }

    // Apply the updated permissions
    await ctx.api.setChatPermissions(chatId, updatedPermissions);
  }
  @SafeExecution()
  static async addBlackList(ctx: Context) {
    await BlacklistService.addBlackList(ctx);
  }

  @SafeExecution()
  static async getBlackList(ctx: Context) {
    await BlacklistService.BlackList(ctx);
  }
  @SafeExecution()
  static async RemoveMessageBlackList(ctx: Context) {
    await BlacklistService.remove(ctx);
  }

  @SafeExecution()
  static async date(ctx: Context) {
    await DateCommand.date(ctx);
  }

  @SafeExecution()
  static async rules(ctx: Context) {
    await Rules.rules(ctx)
  }
}
