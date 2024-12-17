import { BotReply } from '../utils/chat/BotReply';
import { MessagesService } from '../service/messages';
import { RateLimitConfig } from '../types/CommandTypes';
import { RateLimiter } from '../utils/RateLimiter';
import { createDecorator } from './index';
/**
 * A decorator to restrict commands to group chats.
 * Provides user feedback for invalid chat types.
 */
export function RestrictToGroupChats() {
  return createDecorator(async (ctx, next, close) => {
    const chat = ctx.chat!;
    const reply = new BotReply(ctx);

    try {
      if (chat.type === 'supergroup' || chat.type === 'group') {
        await next();
        return;
      } else if (chat.type === 'private') {
        await reply.textReply('This command can only be used in group chats.');
        close();
      } else if (chat.type === 'channel') {
        await reply.textReply('This command cannot be used in channels.');
        close();
      } else {
        await reply.textReply('This command is not supported in this type of chat.');
        close();
      }
    } catch (error) {
      console.error('Error in RestrictToGroupChats decorator:', error);
      await reply.textReply('An unexpected error occurred. Please try again later.');
      close();
    }
  });
}
export function MessageValidator() {
  return createDecorator(async (ctx, next) => {
    const messageService = new MessagesService(ctx);
    await Promise.all([
      messageService.isNewUser(),
      messageService.isCode(),
      messageService.checkAndHandleBlacklistedWords(),
      messageService.userIsLeftGroup(),
      messageService.askCommand(),
      messageService.executeCommand(),
    ]);
    await next();
  });
}
/**
 * A decorator to ensure the command is being triggered as a reply to another message.
 * Provides user feedback if the command is not triggered as a reply.
 */
export function RequireReply() {
  return createDecorator(async (ctx, next, close) => {
    const reply = new BotReply(ctx);
    let replyMessage = ctx.message?.reply_to_message;
    if (ctx.message?.reply_to_message?.forum_topic_created) {
      replyMessage = undefined;
    }
    try {
      if (!replyMessage) {
        await reply.textReply('This command must be a reply to another message.');
        close();
        return;
      }

      await next();
    } catch (error) {
      console.error('Error in RequireReply decorator:', error);
      await reply.textReply('An unexpected error occurred. Please try again later.');
      close();
    }
  });
}
export function RateLimit(config: RateLimitConfig = {}) {
  const limiter = new RateLimiter(config.commandLimit || 5, config.timeFrame || 10000); // Initialize the limiter

  return createDecorator(async (ctx, next, close) => {
    const userId = ctx.from?.id;
    if (!userId) {
      close();
      return;
    }
    if (limiter.checkRateLimit(userId)) {
      return await next();
    } else {
      await ctx.reply('⏳ You are being rate-limited. Please try again later.');
      close();
    }
  });
}
