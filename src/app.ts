import { Bot } from "grammy";
import { Context } from "mocha";
// import { GenerateCommand } from "./service/command/generator";
// import { MessageCheck } from "./service/MessageCheck";
// import { Spam } from "./service/bot/spam";
// import { Logger } from "./config/logger";
// import { db } from "./service/db";
// const logger = new Logger({
//   file: "app.log",
//   level: "info",
//   timestampFormat: "locale",
//   rotation: {
//     enabled: true,
//     maxSize: 5 * 1024 * 1024, // 5 MB
//     maxFiles: 3,
//   },
//   errorHandling: {
//     file: "error-app.log",
//     console: true,
//   },
// });
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
bot.command('start',(ctx)=>{
  ctx.reply("hello from deploy");
});
// new GenerateCommand(bot).generate();
// bot.on("message", async (ctx) => {
//    if (!ctx.chat) {
//      return;
//    }
//   await MessageCheck.isCode(ctx);
//   await Spam.WarnSpam(ctx);
//   await MessageCheck.isNewUser(ctx);
//   await MessageCheck.leftGroup(ctx);
  
// });
// bot.on("my_chat_member", MessageCheck.initialGroup);
(async () => {
  try {
    // await db.initialize();
    bot.start();
    // logger.info("BOT STARTED", "APP");
  } catch (error: any) {
    // logger.error("ERROR FROM START APP", error.message, "APP");
    // await db.close();
    process.exit(1);
  }
})();
