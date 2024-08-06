import { Context } from "grammy";
import { MESSAGE } from "../helper/message";
import { SafeExecution } from "../decorators/SafeExecution";
import { MuteService } from "../service/command/mute";
import { executeService, executeServiceAdmin, parseDuration } from "../helper";
import { WarnService } from "../service/command/warn";
import { BanService } from "../service/command/ban";
import { BotOverseer } from "../service/bot";
import { BlacklistService } from "../service/command/blacklist";
import { DateCommand } from "../service/command/date";
import { Rules } from "../service/command/rules";
import { Approved } from "../service/command/approved";
import { Permissions } from "../service/command/Permissions";
export class AdminCommand {
  @SafeExecution()
  static async warn(ctx: Context): Promise<void> {
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
  static async purge(ctx: Context): Promise<any> {
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
  static async lock(ctx: Context) {
    const type = String(ctx.match);
    await Permissions.modify(ctx, "lock", type);
  }

  @SafeExecution()
  static async unLock(ctx: Context) {
    const type = String(ctx.match);
    await Permissions.modify(ctx, "unlock", type);
  }
  @SafeExecution()
  static async rmWarn(ctx: Context) {
    await executeServiceAdmin(ctx, WarnService, "clear");
  }

  @SafeExecution()
  static async unMute(ctx: Context) {
    await executeServiceAdmin(ctx, MuteService, "unmute");
  }

  @SafeExecution()
  static async ban(ctx: Context) {
    await executeServiceAdmin(ctx, BanService, "ban");
  }

  @SafeExecution()
  static async unBan(ctx: Context) {
    await executeServiceAdmin(ctx, BanService, "unban");
  }

  @SafeExecution()
  static async abl(ctx: Context) {
    await executeService(ctx, BlacklistService, "addBlackList");
  }

  @SafeExecution()
  static async blacklist(ctx: Context) {
    await executeService(ctx, BlacklistService, "BlackList");
  }

  @SafeExecution()
  static async rmbl(ctx: Context) {
    await executeService(ctx, BlacklistService, "remove");
  }

  @SafeExecution()
  static async date(ctx: Context) {
    await executeService(ctx, DateCommand, "date");
  }

  @SafeExecution()
  static async rules(ctx: Context) {
    await executeService(ctx, Rules, "rules");
  }

  @SafeExecution()
  static async approved(ctx: Context) {
    await executeService(ctx, Approved, "add");
  }

  @SafeExecution()
  static async unApproved(ctx: Context) {
    await executeService(ctx, Approved, "remove");
  }
}
