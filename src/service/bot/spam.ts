import { Context } from "grammy";
import { WarnService } from "../command/warn";
import { SafeExecution } from "../../decorators/SafeExecution";
import { MessageCheck } from "../MessageCheck";
import { GroupSettingsService } from "../db/group";

export class Spam {
  static MessageCounts: Map<
    number,
    { count: number; lastMessageTime: number }
  > = new Map();

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
  static async toggleSpamTime(ctx: Context, toggle: boolean) {
     const groupId = ctx.chat!.id;
     const groupRepo = new GroupSettingsService();
     const groupSettings = await groupRepo.getByGroupId(groupId);
     if (groupSettings) {
       if (toggle && !groupSettings.isSpamTime) {
         groupSettings.isSpamTime = toggle;
         await groupRepo.save(groupSettings);
         await ctx.reply("Spam time has started! 🎉");
       } else if (!toggle && groupSettings.isSpamTime) {
         groupSettings.isSpamTime = toggle;
         await groupRepo.save(groupSettings);
       }
     }
  }

  @SafeExecution()
  static async checkAndToggleSpamTime(ctx: Context) {
    const now = new Date();

    // Check if it's within spam time (12:45 AM to 1:00 AM)
    if (await Spam.isWithinTimeRange(now, "00:45", "13:00")) {
      await Spam.toggleSpamTime(ctx, true);
    } else {
      await Spam.toggleSpamTime(ctx, false);
    }
  }

  @SafeExecution()
  static async WarnSpam(ctx: Context) {
    await Spam.checkAndToggleSpamTime(ctx);

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
          userData.count = 1; 
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
