import { SafeExecution } from "../decorators/SafeExecution";
import { Middleware } from "./mid";

export class ActionFilter extends Middleware {
  @SafeExecution()
  /**
   * Middleware to ensure the command is used in reply to a user's message.
   */
  async isReplied(): Promise<void> {
    const repliedMessage = this.ctx.message?.reply_to_message;

    if (!repliedMessage) {
      await this.ctx.reply(
        "Please use this command in reply to a user's message.",
        {
          reply_to_message_id: this.ctx.message?.message_id,
        }
      );
      return;
    }

    return this.nxt();
  }

  @SafeExecution()
  /**
   * Middleware to check if the replied user is still in the group.
   */
  async userInGroup(): Promise<void> {
    const userId = this.ctx.message?.reply_to_message?.from?.id;

    if (!userId) {
      await this.ctx.reply(
        "Unable to determine the user ID. Please ensure you are replying to a valid user.",
        { reply_to_message_id: this.ctx.message?.message_id }
      );
      return;
    }

    const chatMember = await this.ctx.getChatMember(userId);

    if (chatMember.status === "left" || chatMember.status === "kicked") {
      await this.ctx.reply("The user is no longer a member of this group.", {
        reply_to_message_id: this.ctx.message?.message_id,
      });
      return;
    }

    return this.nxt();
  }

  @SafeExecution()
  /**
   * Middleware to validate command execution based on admin status.
   */
  async adminCheckForRepliedUser(): Promise<void> {
    const [chatAdmins, repliedUserId] = await Promise.all([
      this.bot.fetchAdmins(),
      this.bot.getRepliedUserId(),
    ]);

    const isAdmin = chatAdmins!.some(
      (admin) => admin.user.id === repliedUserId
    );
    const command = this.ctx.message?.text?.split("/")[1];

    if (this.bot.getBotInfo()!.id === repliedUserId) {
      await this.ctx.reply(`Why should I ${command} myself?`, {
        reply_to_message_id: this.ctx.message?.message_id,
      });
      return;
    }

    if (isAdmin) {
      await this.ctx.reply(`Why should I ${command} an admin?`, {
        reply_to_message_id: this.ctx.message?.message_id,
      });
      return;
    }

    return this.nxt();
  }
}