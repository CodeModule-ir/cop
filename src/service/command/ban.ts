import { Context } from "grammy";
import { MESSAGE } from "../../helper/message";
import { Permissions } from "./Permissions";
import { GroupMembershipService } from "../db/group/Membership";
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
    // Step 1: Lift any existing restrictions (mute, restrict, etc.)
    await this.resetUser();

    // Step 2: Ban the user
    await this.ctx.api.banChatMember(this.ctx.chat?.id!, this.userId);

    // Step 3: Delete user data from the database
    await this.deleteUserData();
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
   * Deletes the user's data from the database.
   */
  private async deleteUserData() {
    await new GroupMembershipService().deleteUser(this.userId);
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
