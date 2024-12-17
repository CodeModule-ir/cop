import { Context, InlineKeyboard } from 'grammy';
import { RepliedMessage } from '../../types/CommandTypes';
import { Catch } from '../../decorators/Catch';

export class BotReply {
  private ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }
  @Catch()
  async send(message: string): Promise<void> {
    await this.ctx.reply(message);
  }
  async sendToTopic(message: string, topicId: number) {
    await this.ctx.api.sendMessage(this.ctx.chat!.id, message, {
      reply_to_message_id: undefined,
      message_thread_id: topicId, // The thread ID for the forum topic
    });
  }
  @Catch()
  async textReply(message: string, options: { reply_markup?: InlineKeyboard } = {}): Promise<void> {
    await this.ctx.reply(message, {
      reply_markup: options.reply_markup,
      reply_to_message_id: this.ctx.message?.message_id,
    });
  }
  @Catch()
  async replyToMessage(message: string): Promise<void> {
    await this.ctx.reply(message, {
      parse_mode: 'HTML',
      reply_parameters: {
        message_id: this.ctx.message?.reply_to_message?.message_id!,
      },
    });
  }
  @Catch()
  async markdownReply(message: string): Promise<void> {
    await this.ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_parameters: {
        message_id: this.ctx.message?.message_id!,
      },
    });
  }
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
