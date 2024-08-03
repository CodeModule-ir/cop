import { SafeExecution } from "../decorators/SafeExecution";
import { Middleware } from "./mid";
import { Context, NextFunction } from "grammy";
import { BotOverseer } from "../service/bot";

export class AdminChecker extends Middleware {
  @SafeExecution()
  async checkAdminStatus() {
    const userId = (await this.bot.getUser()).id;
    const isAdmin = await this.bot.isUserAdmin(userId);
    if (!isAdmin) {
      await this.ctx.reply(
        "Sorry, but you need to be an admin to use this command!",
        { reply_to_message_id: this.ctx.message?.message_id }
      );
      return;
    }
    return this.nxt();
  }
}

export async function botIsAdmin(ctx: Context, nxt: NextFunction) {
  const botIsAdmin = await new BotOverseer(ctx).isBotAdmin();
  if (!botIsAdmin) {
    await ctx.reply(
      "Sorry, but I don't have the necessary permissions to perform this action. Please ensure that I am an admin in this group.",
      { reply_to_message_id: ctx.message?.message_id }
    );
    return;
  }
  return nxt();
}
