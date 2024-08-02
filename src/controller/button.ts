import { Context } from "grammy";
import { BotService } from "../helper/manager";
import { WarnService } from "../service/warn";
import { MESSAGE } from "../helper/message";

export class Button {
  /**
   * Clears warnings for a user and updates the message in the chat.
   * Handles the callback query to remove warnings and provides user feedback.
   *
   * @param ctx - The context of the callback query.
   */
  static async clear(ctx: Context) {
    const { BotManager, InlineKeyboard } = new BotService(ctx);
    if (await new WarnService(ctx, InlineKeyboard.userId).clear()) {
      const username = await InlineKeyboard.getWarnUsername();
      await ctx.answerCallbackQuery("Warnings removed!");
      await ctx.editMessageText(
        MESSAGE.WARNING_CLEARED(username, BotManager.user?.username!)
      );
    } else {
      await ctx.answerCallbackQuery("No warnings to remove.");
    }
  }
}
