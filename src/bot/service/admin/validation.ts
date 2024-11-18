import { Context } from 'grammy';
import { BotReply } from '../../../utils/chat/BotReply';
import { ChatInfo } from '../../../utils/chat/ChatInfo';

export class AdminValidationService {
  /**
   * Validates the context for approval-related commands.
   * Ensures the command is executed in a valid group, on a valid user, and as a reply to a message.
   * @param ctx - The bot's context object.
   * @returns An object containing groupId and userId if validation succeeds; otherwise, returns null.
   */
  static async validateContext(ctx: Context): Promise<{ groupId: number; userId: number } | null> {
    const reply = new BotReply(ctx);
    const command = ctx.message?.text?.split('/')[1].split(' ')[0].toLowerCase().trim();
    // Check if the command is a reply to a user's message
    const replyMessage = ctx.message?.reply_to_message;
    if (!replyMessage) {
      await reply.textReply("To use this command, please reply to a user's message.");
      return null;
    }
    // Ensure the user ID of the replied message is valid
    const userId = replyMessage.from?.id;
    if (!userId) {
      await reply.textReply('Error: Could not identify the user. Please ensure you are replying to a valid user message.');
      return null;
    }

    // Validate that the command is executed in a group or supergroup
    const chat = ctx.chat;
    if (!chat || !(chat.type === 'group' || chat.type === 'supergroup')) {
      await reply.textReply('This command can only be used in a group or supergroup.');
      return null;
    }
    if (replyMessage.from?.id === ctx.me.id) {
      await reply.textReply(`I can't ${command} myself. Please specify a different user to ${command}.`);
      return null;
    }
    const chatinfo = new ChatInfo(ctx);
    const isAdmin = await chatinfo.isAdmin(replyMessage.from?.id!);
    if (isAdmin) {
      await reply.textReply(`I can't ${command} an admin. Please provide a different user to ${command}.`);
      return null;
    }
    // Return validated groupId and userId
    return {
      groupId: chat.id,
      userId,
    };
  }
}
