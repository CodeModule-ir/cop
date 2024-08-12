import { Context } from "grammy";
import { BotOverseer } from "../service/bot";
import { Logger } from "../config/logger";
import { ParseMode } from "grammy/types";
const logger = new Logger({
  file: "error.log",
  level: "error",
  timestampFormat: "locale",
});

export async function handleError(
  ctx: Context,
  error: any,
  propertyKey: string
) {
  const userId = ctx.from?.id || "Unknown";
  const chatId = ctx.chat?.id || "Unknown";
  const command = ctx.message?.text?.split(" ")[0] || "Unknown command";
  // Log the error with detailed ctx
  logger.error(`An error occurred in ${propertyKey}:`, error, "Context", {
    command,
    userId,
    chatId,
    stackTrace: error.stack,
  });
}

export function parseDuration(durationStr: string): number | null {
  const match = durationStr.match(/^(\d+)([smhd])$/);

  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000; // Seconds
    case "m":
      return value * 60 * 1000; // Minutes
    case "h":
      return value * 60 * 60 * 1000; // Hours
    case "d":
      return value * 24 * 60 * 60 * 1000; // Days
    default:
      return null;
  }
}
export const COMMANDS: string[] = [
  "start",
  "help",
  "warn",
  "rmWarn",
  "mute",
  "unMute",
  "ban",
  "unBan",
  "purge",
  "approved",
  "unApproved",
  "lock",
  "unLock",
  "blacklist",
  "abl",
  "rmbl",
  "date",
  "future",
  "rules",
  "approvedList",
  "shahin",
  "aran",
  "codeTime",
];
export async function executeService(
  ctx: Context,
  service: any,
  method: string
) {
  if (service[method]) {
    (await service[method](ctx)) || (await new service(ctx)[method]);
  } else {
    logger.error(`Method ${method} not found on service ${service.name}`);
  }
}
export async function executeServiceAdmin(
  ctx: Context,
  ServiceClass: any,
  action: string
): Promise<void> {
  const bot = new BotOverseer(ctx);
  const userId = await bot.getRepliedUserId();
  if (userId && typeof ServiceClass.prototype[action] === "function") {
    const serviceInstance = new ServiceClass(ctx, userId);
    const responseMessage = await serviceInstance[action]();

    if (responseMessage) {
      await ctx.reply(responseMessage, {
        reply_to_message_id: ctx.message?.message_id,
      });
    }
  } else {
    logger.error(`Action ${action} not found on service ${ServiceClass.name}`);
  }
}
export function tehranZone() {
  // Get current date and adjust to Tehran time zone
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;

  // Tehran timezone offset in minutes (UTC+3:30)
  const tehranOffset = 3.5 * 60;

  // Adjust time to Tehran timezone without considering DST
  return new Date(utcTime + tehranOffset * 60000);
}
export class ReplyBuilder {
  private ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  /**
   * Generates reply options with the current message ID.
   */
  withCurrentMessageId() {
    return {
      reply_to_message_id: this.ctx.message?.message_id!,
    };
  }
  withRepliedMessageId() {
    return {
      reply_to_message_id: this.ctx.message?.reply_to_message?.message_id!,
    };
  }

  withCurrentMessageIdAndParseMode(parseMode?: string) {
    return {
      reply_to_message_id: this.ctx.message?.message_id!,
      parse_mode: parseMode,
    };
  }

  withRepliedMessageIdAndParseMode(parseMode?: ParseMode) {
    return {
      reply_to_message_id: this.ctx.message?.reply_to_message?.message_id!,
      parse_mode: parseMode,
    };
  }

  async sendReply(privateMessage: string,groupMessage?: string, parseMode?: ParseMode) {
    if (this.ctx.chat?.type === "private") {
      return this.ctx.reply(privateMessage);
    }
    if (groupMessage) {
      if (parseMode) {
        return this.ctx.reply(groupMessage, this.withRepliedMessageIdAndParseMode(parseMode));
      }
      return this.ctx.reply(groupMessage,this.withCurrentMessageId())
    }
  }
}
