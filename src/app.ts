import { Bot } from "grammy";
import { GenerateCommand } from "./service/command/generator";
import { MessageCheck } from "./service/MessageCheck";
import { Spam } from "./service/bot/spam";
import { logger } from "./config/logger";
import { db } from "./service/db";
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
new GenerateCommand(bot).generate();
bot.on("message", async (ctx) => {
  if (!ctx.chat) {
    return;
  }
  await MessageCheck.Message(ctx);
  await MessageCheck.isCode(ctx);
  await MessageCheck.CheckBlackList(ctx);
  await Spam.WarnSpam(ctx);
  await MessageCheck.isNewUser(ctx);
  await MessageCheck.leftGroup(ctx);
});
bot.on("my_chat_member", MessageCheck.initialGroup);
(async () => {
  try {
    await db.initialize();
    bot.start();
    logger.info("BOT STARTED", "APP");
  } catch (error: any) {
    logger.error("ERROR FROM START APP", error.message, "APP");
    await db.close();
    process.exit(1);
  }
})();
