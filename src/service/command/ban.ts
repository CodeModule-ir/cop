import { Context } from "grammy";
import { MESSAGE } from "../../helper/message";
import { AppDataSource } from "../../config/db";
import { GroupMembership } from "../../entities/GroupMembership";
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
  async ban(reply:boolean=true) {
    // Step 1: Lift any existing restrictions (mute, restrict, etc.)
    await this.resetUser();

    // Step 2: Ban the user
    await this.ctx.api.banChatMember(this.ctx.chat?.id!, this.userId);

    // Step 3: Delete user data from the database
    await this.deleteUserData();
    if (!reply) {
      return MESSAGE.BAN_USE_BLACKLIST_MSG(this.ctx.message?.from!)
    }
    // Return a success message
    return MESSAGE.BAN(this.ctx.message?.reply_to_message?.from!);
  }
  /**
   * Lifts all restrictions on the user (mute, restrict, etc.).
   */
  private async resetUser() {
    // Remove restrictions
    await this.ctx.restrictChatMember(this.userId, {
      can_send_messages: true,
      can_send_polls: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true,
      can_change_info: true,
      can_invite_users: true,
      can_pin_messages: true,
    });
  }

  /**
   * Deletes the user's data from the database.
   */
  private async deleteUserData() {
    const groupMembershipRepo = AppDataSource.getRepository(GroupMembership);
    await groupMembershipRepo.delete({ user: { id: this.userId } });
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
