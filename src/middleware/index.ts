import { Context, NextFunction } from "grammy";
import { ActionFilter } from "./ActionFilter"
import { AdminChecker } from "./isAdmin";

export class CmdMid {
  static async isReplied(ctx: Context, nxt: NextFunction) {
    await new ActionFilter(ctx, nxt).isReplied();
  }
  static async userInGroup(ctx: Context, nxt: NextFunction) {
    await new ActionFilter(ctx, nxt).userInGroup();
  }
  static async adminCheckForRepliedUser(ctx: Context, nxt: NextFunction) {
    await new ActionFilter(ctx, nxt).adminCheckForRepliedUser();
  }
  static async AdminStatus(ctx: Context, nxt: NextFunction) {
    await new AdminChecker(ctx, nxt).checkAdminStatus();
  }
  static async isValidChatType(ctx: Context, nxt: NextFunction) {
    await new ActionFilter(ctx, nxt).isValidChatType();
  }
}
