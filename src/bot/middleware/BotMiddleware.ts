import { Context, NextFunction } from 'grammy';
import { BotReply } from '../../utils/chat/BotReply';
import { BotInfo } from '../../utils/chat/BotInfo';
import { ChatInfo } from '../../utils/chat/ChatInfo';

export class BotMiddleware {
  static async userIsAdmin(ctx: Context, nxt: NextFunction | null, isMiddleware: boolean = true) {
    const reply = new BotReply(ctx);
    const chatInfo = new ChatInfo(ctx);
    const userIsAdmin = await chatInfo.userIsAdmin();
    const command = ctx.message?.text?.split('/')[1].split(' ')[0].toLowerCase().trim();
    if (command === 'warns') {
      if (isMiddleware) {
        return nxt!();
      } else {
        return true;
      }
    }
    if (!userIsAdmin) {
      await reply.textReply('Sorry, but you need to be an admin to use this command!');
      return false;
    }
    if (isMiddleware) {
      return nxt!();
    } else {
      return true;
    }
  }
  static async botIsAdmin(ctx: Context, nxt: NextFunction | null, isMiddleware: boolean = true) {
    const reply = new BotReply(ctx);
    const bot = new BotInfo(ctx);
    const botIsAdmin = await bot.isAdmin();
    const message = `
Sorry, but I don't have the necessary permissions to perform this action. Please ensure that I am an admin in this group.
    `;
    if (!botIsAdmin) {
      await reply.textReply(message);
      return false;
    }
    if (isMiddleware) {
      return nxt!();
    } else {
      return true;
    }
  }
  static async isGroupChat(ctx: Context, nxt: NextFunction | null, isMiddleware: boolean = true) {
    const chat = ctx.chat;
    const reply = new BotReply(ctx);
    if (chat) {
      if (chat.type === 'supergroup' || chat.type === 'channel') {
        if (isMiddleware) {
          return nxt!();
        } else {
          return true;
        }
      } else if (chat.type === 'private') {
        await reply.textReply('This command can only be used in group chats');
        return false;
      } else {
        await reply.textReply('This command is not allowed in this type of chat.');
        return false;
      }
    }
  }
  /**
   * Middleware to validate command execution based on admin status.
   */
  static async adminCheckForRepliedUser(ctx: Context, nxt: NextFunction | null, isMiddleware: boolean = true) {
    const reply = new BotReply(ctx);
    const replyMeseage = ctx.message?.reply_to_message!;
    let repliedUserId: number | null;
    if (replyMeseage && !replyMeseage?.forum_topic_created) {
      repliedUserId = replyMeseage!.from?.id!;
    } else {
      repliedUserId = null;
    }

    const admins = await ctx.api.getChatAdministrators(ctx.chat!.id);
    const isAdmin = admins!.some((admin) => admin.user.id === repliedUserId);
    const command = ctx.message?.text?.split('/')[1].split(' ')[0].toLowerCase().trim();
    if (command === 'revoke' || command === 'grant' || command === 'pin' || command === 'unpin' || command === 'purge') {
      if (isMiddleware) {
        return nxt!();
      } else {
        return true;
      }
    }
    if (ctx.me!.id === repliedUserId) {
      await reply.textReply(`Why should I ${command} myself?`);
      return false;
    }

    if (isAdmin) {
      await reply.textReply(`Why should I ${command} an admin?`);
      return false;
    }

    if (isMiddleware) {
      return nxt!();
    } else {
      return true;
    }
  }
}
