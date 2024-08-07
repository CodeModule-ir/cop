import { Context } from "grammy";
import { ChatMemberAdministrator, ChatMemberOwner, User } from "grammy/types";
import { SafeExecution } from "../../decorators/SafeExecution";
import { BotInfo, RepliedMessage } from "../../types/types";
import { logger } from "../../config/logger";
export class BotOverseer {
  private ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }
  get user() {
    return this.ctx.from;
  }
  @SafeExecution()
  async isBotAdmin(): Promise<boolean> {
    const botInfo = await this.getBotInfo();
    if (!botInfo) {
      logger.error("Bot info is not available.", undefined, "isBotAdmin");
      return false;
    }

    const chatMember = await this.ctx.getChatMember(botInfo.id);
    if (!chatMember) {
      logger.error(
        "Failed to fetch chat member info for the bot.",
        undefined,
        "isBotAdmin"
      );
      return false;
    }
    return ["administrator", "creator"].includes(chatMember.status);
  }
  @SafeExecution()
  async isUserAdmin(userId: number): Promise<boolean> {
    const memberInfo = await this.ctx.getChatMember(userId);
    return ["administrator", "creator"].includes(memberInfo.status);
  }
  @SafeExecution()
  async fetchAdmins(): Promise<
    (ChatMemberOwner | ChatMemberAdministrator)[] | undefined
  > {
    const admins = await this.ctx.getChatAdministrators();
    if (admins) {
      return admins as (ChatMemberOwner | ChatMemberAdministrator)[];
    }
    return undefined;
  }

  @SafeExecution()
  async getReplyMessage(): Promise<RepliedMessage | undefined> {
    const repliedMessage = this.ctx.message?.reply_to_message;
    if (repliedMessage && repliedMessage.from) {
      return repliedMessage as RepliedMessage;
    }
    return undefined;
  }

  @SafeExecution()
  async getRepliedUserId(): Promise<number | undefined> {
    const replied = await this.getReplyMessage();
    return replied?.from?.id;
  }

  @SafeExecution()
  getBotInfo(): BotInfo | undefined {
    return this.ctx.me!;
  }
  /**
   * Retrieves the user information from the context.
   * Handles the case where user information might be missing and logs errors if necessary.
   *
   * @returns {User | undefined} The user object or undefined if not available.
   */
  @SafeExecution()
  async getUser(): Promise<User> {
    const user = await this.ctx.message?.from;
    if (!user) {
      logger.error(
        "User information is not available in the context in getUser",
        undefined,
        "BotOverseer Class",
        {
          context: this.ctx,
        }
      );
    }
    return user!;
  }
  @SafeExecution()
  async userInGroup(msg: string = "The user is no longer a member of this group."): Promise<boolean | undefined> {
    const id = await this.getRepliedUserId();
    if (!id) {
      await this.ctx.reply(
        "Unable to determine the user ID. Please ensure you are replying to a valid user.",
        {
          reply_to_message_id: this.ctx.message?.message_id,
        }
      );
      return;
    }

    const chatMember = await this.ctx.getChatMember(id);

    if (chatMember.status === "left" || chatMember.status === "kicked") {
      await this.ctx.reply(msg, {
        reply_to_message_id: this.ctx.message?.message_id,
      });
      return true;
    }
    return false;
  }
}
