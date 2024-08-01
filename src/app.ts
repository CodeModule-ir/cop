import { Bot } from "grammy";
import { AppDataSource } from "./config/db";
import { logger } from "./helper/logging";
import { CmdValidator } from "./middleware";
import { Button } from "./controller/button";
import { GenerateCommand } from "./helper/gen.command";
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
new GenerateCommand(bot).generate()
bot.callbackQuery(/^remove_warning_(\d+)$/, CmdValidator.isAdmin, Button.clear);

(async () => {
  try {
    await AppDataSource.initialize();
    logger.info("DATABASE INITIALIZED", "DATABASE");
    bot.start();
    logger.info("BOT STARTED", "APP");
  } catch (error: any) {
    logger.error("ERROR FROM START APP", error, "APP");
  }
})();
