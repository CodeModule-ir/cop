import { BotReply } from '../utils/chat/BotReply';
import { BotInfo } from '../utils/chat/BotInfo';
import { createDecorator } from '.';
import { jokeMessage } from '../utils';
export function BotIsAdmin() {
  return createDecorator(async (ctx, next, close) => {
    const reply = new BotReply(ctx);
    const bot = new BotInfo(ctx);
    const botIsAdmin = await bot.isAdmin();
    if (!botIsAdmin) {
      await reply.textReply('I need to be an administrator to execute this command.');
      close();
    }
    await next();
  });
}
export function ReplyToBot() {
  return createDecorator(async (ctx, next, close) => {
    const reply = new BotReply(ctx);
    const replyMessage = ctx.message?.reply_to_message?.from!;
    if (replyMessage && replyMessage.id! === ctx.me.id) {
      const randomMessage = jokeMessage();
      await reply.textReply(randomMessage);
      close();
      return;
    }
    await next();
  });
}
