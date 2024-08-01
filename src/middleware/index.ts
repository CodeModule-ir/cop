import { Context, NextFunction } from "grammy";
import { IsAdmin } from "./isAdmin";
import { ValidateCommand } from "./validateCommand";

export class CmdValidator {
  static async run(ctx: Context, next: NextFunction) {
    const checkAdmin = new IsAdmin(ctx, async () => {
      const validateCommand = new ValidateCommand(ctx, next);
      await validateCommand.execute();
    });

    await checkAdmin.execute();
  }
  static async isAdmin(ctx: Context, nxt: NextFunction) {
    const chatAdmins = await ctx.getChatAdministrators();
    const isAdmin = chatAdmins.some((admin) => admin.user.id === ctx.from?.id);
    if (!isAdmin) {
      return await ctx.answerCallbackQuery({
        text: "Only admins can remove warnings!",
        show_alert: true,
      });
    }
    nxt();
  }
}
