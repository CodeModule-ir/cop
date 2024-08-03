import { Context } from "grammy";
import { logger } from "../config/logging";
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
