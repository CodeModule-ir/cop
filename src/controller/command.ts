import { Context } from "grammy";
import { MESSAGE } from "../helper/message";
import { SafeExecution } from "../decorators/SafeExecution";
import { listAdmins } from "../user-management/roles";
import { AdminCommand } from "../user-management/AdminCommand";
import { UserManagement } from "../user-management/UserManagement";
export class Command {
  @SafeExecution()
  static start(ctx: Context) {
    if (ctx.chat?.type === "private") {
      return ctx.reply(MESSAGE.START());
    }
    return ctx.reply(MESSAGE.START(), {
      reply_parameters: {
        message_id: ctx.message?.message_id!,
      },
    });
  }
  @SafeExecution()
  static help(ctx: Context) {
    if (ctx.chat?.type === "private") {
      return ctx.reply(MESSAGE.HELP());
    }
    return ctx.reply(MESSAGE.HELP(), {
      parse_mode: "Markdown",
      reply_parameters: {
        message_id: ctx.message?.message_id!,
      },
    });
  }
  @SafeExecution()
  static async admins(ctx: Context) {
    await listAdmins(ctx);
  }

  @SafeExecution()
  static async warn(ctx: Context): Promise<void> {
    await AdminCommand.Warn(ctx);
  }

  @SafeExecution()
  static async unWarn(ctx: Context): Promise<void> {
    await AdminCommand.WarnClear(ctx);
  }

  @SafeExecution()
  static async me(ctx: Context): Promise<void> {
    await UserManagement.Info(ctx);
  }

  @SafeExecution()
  static async mute(ctx: Context): Promise<void> {
    await AdminCommand.mute(ctx);
  }

  @SafeExecution()
  static async unMute(ctx: Context): Promise<void> {
    await AdminCommand.MuteClear(ctx);
  }
}
