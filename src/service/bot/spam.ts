import { Context } from "grammy";
import { WarnService } from "../command/warn";
import { SafeExecution } from "../../decorators/SafeExecution";
import { MessageCheck } from "../MessageCheck";

export class Spam {
  static MessageCounts: Map<
    number,
    { count: number; lastMessageTime: number }
  > = new Map();

  static messageFlags: { [groupId: number]: { [date: string]: boolean } } = {};

  @SafeExecution()
  static isWithinTimeRange(current: Date, start: string, end: string): boolean {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    const startTime = new Date(current);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(current);
    endTime.setHours(endHour, endMinute, 0, 0);
    return current >= startTime && current <= endTime;
  }

  @SafeExecution()
  static isExactTime(current: Date): boolean {
    const randomTime = Spam.getRandomTime();
    const [targetHour, targetMinute] = randomTime.split(":").map(Number);
    return (
      current.getHours() === targetHour && current.getMinutes() === targetMinute
    );
  }

  private static getRandomTime(): string {
    const times = ["01:00", "01:05"];
    return times[Math.floor(Math.random() * times.length)];
  }

  @SafeExecution()
  static async WarnSpam(ctx: Context) {
    const chatId = ctx.chat!.id;
    const now = new Date();
    const todayKey = now.toISOString().split("T")[0];

    // Check if within the specified time range
    if (!Spam.messageFlags[chatId]) {
      Spam.messageFlags[chatId] = {};
    }

    if (!Spam.messageFlags[chatId][todayKey]) {
      if (await Spam.isWithinTimeRange(now, "00:45", "00:59")) {
        await ctx.reply("بوی اسپم تایم میاد 😋");
        Spam.messageFlags[chatId][todayKey] = true;
      }
    }

    // Existing spam check logic
    if (ctx.message?.sticker || ctx.message?.animation) {
      const userId = ctx.message.from.id;
      const currentTime = Date.now();

      if (Spam.MessageCounts.has(userId)) {
        const userData = Spam.MessageCounts.get(userId)!;
        if (currentTime - userData.lastMessageTime < 10000) {
          // 10 seconds window
          userData.count += 1;
          if (userData.count >= 5) {
            const isAdmin = await MessageCheck.isAdmin(ctx, userId);
            if (isAdmin) {
              return;
            }
            await Spam.WarnUser(ctx, userId);
            Spam.MessageCounts.delete(userId);
            return;
          }
        } else {
          userData.count = 1; // Reset count if outside the time window
        }
        userData.lastMessageTime = currentTime;
        Spam.MessageCounts.set(userId, userData);
      } else {
        Spam.MessageCounts.set(userId, {
          count: 1,
          lastMessageTime: currentTime,
        });
      }
    }
  }

  @SafeExecution()
  static async WarnUser(ctx: Context, userId: number) {
    const user = ctx.message?.from;

    if (!user) return;

    const username = user.username ? `@${user.username}` : user.first_name;

    const { banned } = await new WarnService(ctx, userId).warn("don't spam");
    await ctx.reply(
      `Hello ${username}, we noticed that you're sending a lot of stickers or GIFs. Please avoid spamming to ensure a pleasant experience for everyone. If you continue, further actions might be taken. Thank you for your understanding!`
    );
    if (banned) {
      await ctx.reply(
        `Mr. ${username} has been banned for repeated spamming. Please adhere to the group rules.`
      );
    }
  }
}