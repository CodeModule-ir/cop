import { Context } from 'grammy';
import { BotReply } from '../../../utils/chat/BotReply';

export class AdminValidationService {
  /**
   * Validates the context for approval-related commands.
   * Ensures the command is executed in a valid group, on a valid user, and as a reply to a message.
   * @param ctx - The bot's context object.
   * @returns An object containing groupId and userId if validation succeeds; otherwise, returns null.
   */
  static async validateContext(ctx: Context): Promise<{ groupId: number; userId: number } | null> {
    const reply = new BotReply(ctx);

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
    if (ctx.message?.reply_to_message!.from?.is_bot) {
      await reply.textReply('Why should I approve a robot?');
      return null;
    }
    // Return validated groupId and userId
    return {
      groupId: chat.id,
      userId,
    };
  }
}
