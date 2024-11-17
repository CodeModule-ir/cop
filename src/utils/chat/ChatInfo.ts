import { Context } from 'grammy';
import { BotReply } from './BotReply';
import { RateLimiter } from '../RateLimiter';
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
  async userIsAdmin(): Promise<boolean> {
    const userId = this._ctx.from!.id;
    const chatMember = await this._ctx.getChatMember(userId);

    return chatMember.status === 'administrator' || chatMember.status === 'creator';
  }
  async userReplyIsAdmin(): Promise<boolean | undefined> {
    const reply = new BotReply(this._ctx);
    const repliedMessage = await reply.getReplyMessage();
    if (repliedMessage?.from?.id) {
      const userId = repliedMessage.from.id;
      const chatMember = await this._ctx.getChatMember(userId);
      return chatMember.status === 'administrator' || chatMember.status === 'creator';
    }
    return undefined;
  }
  async adminList(): Promise<string> {
    const admins = await this._ctx.api.getChatAdministrators(this._ctx.chat!.id);
    const adminList = admins
      .filter((admin) => !admin.user.is_bot) // Exclude bots from the admin list
      .map((admin) => `- ${admin.user.first_name} (@${admin.user.username || 'No username'})`)
      .join('\n');
    return adminList;
  }

  async chatInfo(): Promise<{
    groupName: string;
    groupType: string;
    groupDescription: string;
    memberCount: number;
    admins: string;
    inviteLink: string;
  } | null> {
    const group = this._ctx.chat;
    // Ensure we are in a group context
    if (!group || (group.type !== 'group' && group.type !== 'supergroup')) {
      return null;
    }
    const chatDetails = await this._ctx.api.getChat(group.id);

    // Extract information
    const groupName = chatDetails.title || 'Unnamed Group';
    const groupDescription = chatDetails.description || 'No description available';
    const groupType = chatDetails.type === 'supergroup' ? 'Supergroup' : 'Group';
    const memberCount = await this._ctx.api.getChatMemberCount(group.id);
    const inviteLink = chatDetails.invite_link || 'Invite link not available';
    const creator = await this._ctx.api.getChatAdministrators(group.id);
    const adminList = creator.filter((admin) => admin.status === 'administrator' || admin.status === 'creator');
    const admins = adminList
      .map((admin) => {
        const username = admin.user.username ? `@${admin.user.username}` : admin.user.first_name;
        return `${username} (${admin.status === 'creator' ? 'Creator' : 'Admin'})`;
      })
      .join(', ');
    return { groupName, groupType, groupDescription, memberCount, admins, inviteLink };
  }
  async isAdmin(ctx: Context, userId: number): Promise<boolean> {
    if (!RateLimiter.limit(ctx.chat!.id)) {
      return false;
    }
    const chatAdmins = await ctx.getChatAdministrators();
    return chatAdmins.some((admin) => admin.user.id === userId);
  }
}
