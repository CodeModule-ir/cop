import { SafeExecution } from "../decorators/SafeExecution";
import { Middleware } from "./mid";
export class ValidateCommand extends Middleware {
  @SafeExecution()
  async execute(): Promise<void> {
    const repliedMessage = await this.bot.getReplyMessage();
    if (!repliedMessage) {
      await this.ctx.reply(
        "Please use this command in reply to a user's message.",
        {
          reply_to_message_id: this.ctx.message?.message_id,
        }
      );
      return;
    }

    const [chatAdmins, repliedUserId] = await Promise.all([
      this.bot.fetchAdmins(),
      this.bot.getRepliedUserId(),
    ]);

    if (await this.bot.userInGroup()) {
      return;
    }

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
    this.nxt();
  }
}
