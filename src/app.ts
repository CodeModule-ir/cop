import { Bot } from "grammy";
import { AppDataSource } from "./config/db";
import { logger } from "./config/logging";
import { GenerateCommand } from "./service/command/generator";
import { groupJoin } from "./service/bot/groupJoin";
import { MessageCheck } from "./service/MessageCheck";
import { Spam } from "./service/bot/spam";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
new GenerateCommand(bot).generate();
const messageFlags: { [groupId: number]: { [date: string]: boolean } } = {};

bot.on("message", async (ctx) => {
  await MessageCheck.CheckBlackList(ctx);
  await Spam.WarnSpam(ctx);
  const now = new Date();
  const todayKey = now.toISOString().split("T")[0]; // Get today's date as a key
  const chatId = ctx.chat.id;
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
  // Initialize if not already
  if (!messageFlags[chatId]) {
    messageFlags[chatId] = {};
  }
  // Check if the message has been sent today in this group
  if (!messageFlags[chatId][todayKey]) {
    // Check if it's 00:45 AM to send the first message
    if (await Spam.isWithinTimeRange(now, "00:45", "00:59")) {
      await ctx.reply("بوی اسپم تایم میاد 😋");
      messageFlags[chatId][todayKey] = true;
    }
    // Check if it's the exact random time to send the spam time message
    if (await Spam.isExactTime(now)) {
      await ctx.reply("اسپم تایم شروع شد!");
      messageFlags[chatId][todayKey] = true;
    }
  }
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
