import { Bot } from "grammy";
import { AppDataSource } from "./config/db";
import { logger } from "./config/logging";
import { GenerateCommand } from "./service/command/generator";
import { groupJoin } from "./service/bot/groupJoin";
import { MessageCheck } from "./service/MessageCheck";
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
new GenerateCommand(bot).generate();
bot.on("message", async (ctx) => {
  await MessageCheck.CheckBlackList(ctx);
});
bot.on("my_chat_member", groupJoin);

(async () => {
  try {
    await AppDataSource.initialize();
    logger.info("DATABASE INITIALIZED", "DATABASE");
    bot.start();
    logger.info("BOT STARTED", "APP");
  } catch (error: any) {
    logger.error("ERROR FROM START APP", error, "APP");
    process.exit(1)
  }
})();
