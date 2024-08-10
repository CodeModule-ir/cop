import { Context } from "grammy";
import { MESSAGE } from "../../helper/message";
import { Permissions } from "./Permissions";
export class BanService {
  private ctx: Context;
  private userId: number;

  constructor(ctx: Context, userId: number) {
    this.ctx = ctx;
    this.userId = userId;
  }

  /**
   * Bans a user from the chat.
   */
  async ban(reply: boolean = true) {
    await this.resetUser();

    await this.ctx.api.banChatMember(this.ctx.chat?.id!, this.userId);

    if (!reply) {
      return MESSAGE.BAN_USE_BLACKLIST_MSG(this.ctx.message?.from!);
    }
    // Return a success message
    return MESSAGE.BAN(this.ctx.message?.reply_to_message?.from!);
  }
  /**
   * Lifts all restrictions on the user (mute, restrict, etc.).
   */
  private async resetUser() {
    // Remove restrictions
    await this.ctx.restrictChatMember(this.userId, Permissions.DEFAULT);
  }

  /**
   * Unbans a user from the chat.
   */
  async unban() {
    // Unban the user, allowing them to rejoin the chat
    await this.ctx.api.unbanChatMember(this.ctx.chat?.id!, this.userId);
    // Return a success message
    return MESSAGE.UNBAN(this.ctx.message?.reply_to_message?.from!);
  }
}
