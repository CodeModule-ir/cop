import { Context } from "grammy";
import { MESSAGE } from "../../helper/message";
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
  async ban() {
    // Ban the user from the chat
    await this.ctx.api.banChatMember(this.ctx.chat?.id!, this.userId);
    // Return a success message
    return MESSAGE.BAN(this.ctx.message?.reply_to_message?.from!);
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
