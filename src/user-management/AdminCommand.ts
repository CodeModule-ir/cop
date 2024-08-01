import { Context } from "grammy";
import { WarnService } from "../service/warning";
import { BotOverseer } from "../helper/BotOverseer";
import { BotService } from "../helper/manager";
import { MESSAGE } from "../helper/message";
import { SafeExecution } from "../decorators/SafeExecution";

export class AdminCommand {
  @SafeExecution()
  static async Warn(ctx: Context) {
    const bot = new BotOverseer(ctx);
    const [repliedMessage, repliedUserId] = await Promise.all([
      bot.getReplyMessage(),
      bot.getRepliedUserId(),
    ]);

    const username = repliedMessage?.from?.username;
    if (repliedUserId && username) {
      const result = await new WarnService(ctx, repliedUserId, username).warn();
      if (result.banned) {
        await ctx.reply(
          "User has been banned for reaching the maximum warnings."
        );
      } else if (result.warning) {
        await ctx.reply(MESSAGE.WARN(repliedMessage), {
          reply_to_message_id: ctx.message?.message_id,
          reply_markup: result.keyboard,
        });
      }
    }
  }

  @SafeExecution()
  static async WarnClear(ctx: Context) {
    const { BotManager } = new BotService(ctx);
    const responseMessage = await new WarnService(ctx,await BotManager.getRepliedUserId()).clear();
    await ctx.reply(responseMessage, {
      reply_to_message_id: ctx.message?.message_id,
    });
  }
}
