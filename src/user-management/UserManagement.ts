import { Context } from "grammy";
import { BotService } from "../helper/manager";
import { WarnService } from "../service/warning";
import { MESSAGE } from "../helper/message";
import { SafeExecution } from "../decorators/SafeExecution";
export class UserManagement {
  @SafeExecution()
  static async Info(ctx: Context) {
    const { BotManager } = new BotService(ctx);
    const user = await BotManager.getUser();
    const chatMember = await ctx.getChatMember(user.id);
    const warningCount = await new WarnService(ctx, user.id).count();
    const isAdmin =
      chatMember.status === "administrator" || chatMember.status === "creator";

    await ctx.reply(MESSAGE.ME(user, isAdmin, warningCount), {
      reply_to_message_id: ctx.message?.message_id,
      parse_mode: "HTML",
    });
  }
}
