import { Context } from "grammy";
import { WarnService } from "../service/warn";
import { BotOverseer } from "../helper/BotOverseer";
import { MESSAGE } from "../helper/message";
import { SafeExecution } from "../decorators/SafeExecution";
import { MuteService } from "../service/mute";
import { parseDuration } from "../helper";

export class AdminCommand {
  @SafeExecution()
  static async Warn(ctx: Context): Promise<void> {
    const bot = new BotOverseer(ctx);
    const [repliedMessage, repliedUserId] = await Promise.all([
      bot.getReplyMessage(),
      bot.getRepliedUserId(),
    ]);
    const reason: string = String(ctx.match);
    const username = repliedMessage?.from?.username;
    if (repliedUserId && username) {
      const result = await new WarnService(ctx, repliedUserId).warn(reason);
      if (result.banned) {
        await ctx.reply(
          "User has been banned for reaching the maximum warnings.",
          {
            reply_to_message_id: ctx.message?.message_id,
          }
        );
      } else if (result.warning) {
        await ctx.reply(MESSAGE.WARN(repliedMessage), {
          reply_to_message_id: ctx.message?.message_id,
        });
      }
    }
  }

  @SafeExecution()
  static async WarnClear(ctx: Context): Promise<void> {
    const bot = new BotOverseer(ctx);
    const userId = await bot.getRepliedUserId();
    const responseMessage = await new WarnService(ctx, userId!).clear();
    await ctx.reply(responseMessage, {
      reply_to_message_id: ctx.message?.message_id,
    });
  }

  @SafeExecution()
  static async mute(ctx: Context): Promise<void> {
    const bot = new BotOverseer(ctx);
    const userId = await bot.getRepliedUserId();
    const durationStr = String(ctx.match as string);

    if (!userId || !durationStr) {
      await ctx.reply("Please specify a duration for the mute.", {
        reply_to_message_id: ctx.message?.message_id,
      });
      return;
    }

    const durationMs = parseDuration(durationStr);
    if (!durationMs) {
      await ctx.reply(
        "Invalid duration format. Please use a format like '10m' for 10 minutes.",
        {
          reply_to_message_id: ctx.message?.message_id,
        }
      );
      return;
    }

    const expiration = new Date(Date.now() + durationMs);
    const result = await new MuteService(ctx, userId).mute(expiration);

    await ctx.reply(result, {
      reply_to_message_id: ctx.message?.message_id,
    });
  }
  // @SafeExecution()
  static async MuteClear(ctx: Context): Promise<void> {
    const bot = new BotOverseer(ctx);
    const userId = await bot.getRepliedUserId();
    const responseMessage = await new MuteService(ctx, userId!).unmute();
    await ctx.reply(responseMessage!, {
      reply_to_message_id: ctx.message?.message_id,
    });
  }
}
