import { Context } from "grammy";
import { BotOverseer } from "../service/bot";
import { Logger } from "../config/logger";
const logger = new Logger({ file: "error.log", level: "error",timestampFormat:'locale' });

export async function handleError(
  ctx: Context,
  error: any,
  propertyKey: string
) {
  const userId = ctx.from?.id || "Unknown";
  const chatId = ctx.chat?.id || "Unknown";
  const command = ctx.message?.text?.split(" ")[0] || "Unknown command";
  // Log the error with detailed context
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
  "codeTime"
];
export async function executeService(ctx: Context,service: any,method: string) {
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
