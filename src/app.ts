import { Bot } from "grammy";
import { GenerateCommand } from "./service/command/generator";
import { MessageCheck } from "./service/MessageCheck";
import { Spam } from "./service/bot/spam";
import { Logger } from "./config/logger";
import { db } from "./service/db";
const logger = new Logger({
  file: "app.log",
  level: "info",
  timestampFormat: "locale",
  rotation: {
    enabled: true,
    maxSize: 5 * 1024 * 1024, // 5 MB
    maxFiles: 3,
  },
  errorHandling: {
    file: "error-app.log",
    console: true,
  },
});
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
new GenerateCommand(bot).generate();
bot.on("message", async (ctx) => {
  await MessageCheck.CheckBlackList(ctx);
  await Spam.WarnSpam(ctx);
  if (ctx.message?.new_chat_members?.length! > 0) {
    const users = ctx.message?.new_chat_members!;
    for (const user of users) {
      if (user.id !== ctx.me?.id) {
        const username = user.username ? `@${user.username}` : user.first_name;
        await ctx.reply(
          `Dear ${username}, welcome to ${ctx.chat.title} chat ❤️`
        );
      }
    }
  }
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
