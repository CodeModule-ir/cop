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
import { Logger } from "../config/logger";
import { LogExecution } from "../decorators/Logger";
const logger = new Logger({
  file: "admin-command.log",
  level: "info",
  timestampFormat: "locale",
  rotation: {
    enabled: true,
    maxSize: 5 * 1024 * 1024,
    maxFiles: 3,
  },
});

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

    logger.info(
      `warn command triggered by ${ctx.from?.id} in chat ${ctx.chat?.id}`,
      "AdminCommand"
    );

    if (repliedUserId && username) {
      const result = await new WarnService(ctx, repliedUserId).warn(reason);
      if (result.banned) {
        await ctx.reply(
          "User has been banned for reaching the maximum warnings.",
          {
            reply_to_message_id: ctx.message?.message_id,
          }
        );
        logger.info(
          `User ${username} banned for warnings in chat ${ctx.chat?.id}`,
          "AdminCommand"
        );
      } else if (result.warning) {
        await ctx.reply(MESSAGE.WARN(repliedMessage, result.count!, reason), {
          reply_to_message_id: ctx.message?.message_id,
        });
        logger.info(
          `Warning issued to ${username} in chat ${ctx.chat?.id}`,
          "AdminCommand"
        );
      }
    } else {
      logger.warn(
        `Failed to get user information for warning in chat ${ctx.chat?.id}`,
        "AdminCommand"
      );
    }
  }

  @SafeExecution()
  static async mute(ctx: Context): Promise<void> {
    const bot = new BotOverseer(ctx);
    const userId = await bot.getRepliedUserId();
    const durationStr = String(ctx.match as string)
      .trim()
    let durationMs: number | null = null;
    if (durationStr) {
      durationMs = parseDuration(durationStr);
    }

    const expiration = durationMs ? new Date(Date.now() + durationMs) : null;

    logger.info(
      `mute command triggered by ${ctx.from?.id} in chat ${ctx.chat?.id} with duration ${durationStr}`,
      "AdminCommand"
    );

    const result = await new MuteService(ctx, userId!).mute(expiration);
    await ctx.reply(result, {
      reply_to_message_id: ctx.message?.message_id,
    });
    logger.info(
      `User ${userId} muted in chat ${ctx.chat?.id} until ${expiration}`,
      "AdminCommand"
    );
  }

  @SafeExecution()
  static async purge(ctx: Context): Promise<any> {
    const chatId = ctx.chat?.id;
    const replyToMessageId = ctx.message?.reply_to_message?.message_id;
    if (!chatId || !replyToMessageId) {
      logger.warn(
        `Purge command missing chatId or replyToMessageId from ${ctx.from?.id} in chat ${ctx.chat?.id}`,
        "AdminCommand"
      );
      return ctx.reply("Please reply to a message and use the /purge command.");
    }

    let lastMessageId = ctx.message?.message_id;
    if (!lastMessageId) {
      logger.warn(
        `Purge command missing lastMessageId from ${ctx.from?.id} in chat ${ctx.chat?.id}`,
        "AdminCommand"
      );
      return ctx.reply("No message ID found.");
    }

    const countMessages = lastMessageId - replyToMessageId;
    if (countMessages <= 0) {
      logger.warn(
        `No messages to delete or replyToMessageId is newer than lastMessageId from ${ctx.from?.id} in chat ${ctx.chat?.id}`,
        "AdminCommand"
      );
      return ctx.reply(
        "The reply-to message is not older than the current message or no messages to delete."
      );
    }

    const messagesToDelete = [];
    for (let i = 0; i <= countMessages; i++) {
      messagesToDelete.push(replyToMessageId + i);
    }

    const deleteMessagesInBatches = async (messages: number[]) => {
      const batchSize = 100;
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        await ctx.deleteMessages(batch);
      }
    };

    await deleteMessagesInBatches(messagesToDelete);
    await ctx.reply("Deleting done.");
    logger.info(`Purge completed in chat ${ctx.chat?.id}`, "AdminCommand");
  }

  @SafeExecution()
  @LogExecution()
  static async lock(ctx: Context) {
    const type = String(ctx.match);
    await Permissions.modify(ctx, "lock", type);
  }

  @SafeExecution()
  @LogExecution()
  static async unLock(ctx: Context) {
    const type = String(ctx.match);
    await Permissions.modify(ctx, "unlock", type);
  }

  @SafeExecution()
  @LogExecution()
  static async rmWarn(ctx: Context) {
    await executeServiceAdmin(ctx, WarnService, "clear");
  }

  @SafeExecution()
  @LogExecution()
  static async unMute(ctx: Context) {
    await executeServiceAdmin(ctx, MuteService, "unmute");
  }

  @SafeExecution()
  @LogExecution()
  static async ban(ctx: Context) {
    await executeServiceAdmin(ctx, BanService, "ban");
  }

  @SafeExecution()
  @LogExecution()
  static async unBan(ctx: Context) {
    await executeServiceAdmin(ctx, BanService, "unban");
  }

  @SafeExecution()
  @LogExecution()
  static async abl(ctx: Context) {
    await executeService(ctx, BlacklistService, "addBlackList");
  }

  @SafeExecution()
  @LogExecution()
  static async blacklist(ctx: Context) {
    await executeService(ctx, BlacklistService, "BlackList");
  }

  @SafeExecution()
  @LogExecution()
  static async rmbl(ctx: Context) {
    await executeService(ctx, BlacklistService, "remove");
  }

  @SafeExecution()
  @LogExecution()
  static async date(ctx: Context) {
    await executeService(ctx, DateCommand, "date");
  }

  @SafeExecution()
  @LogExecution()
  static async rules(ctx: Context) {
    await executeService(ctx, Rules, "rules");
  }

  @SafeExecution()
  @LogExecution()
  static async approved(ctx: Context) {
    await executeService(ctx, Approved, "add");
  }

  @SafeExecution()
  @LogExecution()
  static async unApproved(ctx: Context) {
    await executeService(ctx, Approved, "remove");
  }

  @SafeExecution()
  @LogExecution()
  static async approvedList(ctx: Context) {
    await executeService(ctx, Approved, "list");
  }
}
