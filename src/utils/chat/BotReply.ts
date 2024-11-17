import { Context, InlineKeyboard } from 'grammy';
import { RepliedMessage } from '../../types/CommandTypes';
import { Catch } from '../../decorators/Catch';

export class BotReply {
  private ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }
  /**
   * Sends a generic reply without any special formatting.
   * @param message - The message to send.
   */
  @Catch()
  async send(message: string): Promise<void> {
    await this.ctx.reply(message);
  }
  /**
   * Sends a plain text reply.
   * @param message - The plain text message to send.
   * @param options - Additional options such as reply markup.
   */
  @Catch()
  async textReply(message: string, options: { reply_markup?: InlineKeyboard } = {}): Promise<void> {
    await this.ctx.reply(message, {
      reply_markup: options.reply_markup,
      reply_to_message_id: this.ctx.message?.message_id, // Corrected the key to `reply_to_message_id`
    });
  }
  /**
   * Sends a plain text reply to a specific message.
   * @param message - The message to send.
   */
  @Catch()
  async replyToMessage(message: string): Promise<void> {
    await this.ctx.reply(message, {
      parse_mode: 'HTML',
      reply_parameters: {
        message_id: this.ctx.message?.reply_to_message?.message_id!,
      },
    });
  }
  /**
   * Sends a reply with Markdown formatting.
   * @param message - Markdown message to send.
   * @param replyToMessage - Whether to reply to the user's message.
   */
  @Catch()
  async markdownReply(message: string): Promise<void> {
    await this.ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_parameters: {
        message_id: this.ctx.message?.message_id!,
      },
    });
  }

  /**
   * Sends a reply with HTML formatting.
   * @param message - HTML formatted message to send.
   * @param replyToMessage - Whether to reply to the user's message.
   */
  @Catch()
  async htmlReply(message: string): Promise<void> {
    await this.ctx.reply(message, {
      parse_mode: 'HTML',
      reply_parameters: {
        message_id: this.ctx.message?.message_id!,
      },
    });
  }

  @Catch()
  async getReplyMessage(): Promise<RepliedMessage | undefined> {
    const repliedMessage = this.ctx.message?.reply_to_message;
    if (repliedMessage && repliedMessage.from) {
      return repliedMessage as RepliedMessage;
    }
    return undefined;
  }
}
