import { Context } from 'grammy';
import { BotReply } from './BotReply';
export class ChatInfo {
  constructor(private _ctx: Context) {}

  getChatType(): 'private' | 'group' | 'supergroup' | 'channel' | 'unknown' {
    return this._ctx.chat?.type ?? 'unknown';
  }
  message() {
    return this._ctx.message;
  }
  entities(): { offset: number; length: number; type: string } | null {
    const entity = this._ctx.message?.entities?.[0];
    if (entity) {
      return {
        offset: entity.offset,
        length: entity.length,
        type: entity.type,
      };
    }
    return null;
  }
  async userInGroup(message: string = 'The user is no longer a member of this group.'): Promise<boolean | undefined> {
    const reply = new BotReply(this._ctx);
    const replied = await reply.getReplyMessage();
    const userId = replied?.from?.id;
    if (!userId) {
      await this._ctx.reply('Unable to determine the user ID. Please ensure you are replying to a valid user.', {
        reply_to_message_id: this._ctx.message?.message_id,
      });
      return;
    }

    const chatMember = await this._ctx.getChatMember(userId);

    if (chatMember.status === 'left' || chatMember.status === 'kicked') {
      await reply.textReply(message);
      return true;
    }
    return false;
  }
  chatIsTopic(): boolean {
    return Boolean(this._ctx.message?.is_topic_message);
  }
  topicName(): string | undefined {
    const message = this._ctx.message;
    if (this.chatIsTopic()) {
      return message?.reply_to_message?.forum_topic_created?.name;
    }
    return undefined;
  }
}
