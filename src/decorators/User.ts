import { BotReply } from '../utils/chat/BotReply';
import { ChatInfo } from '../utils/chat/ChatInfo';
import { createDecorator } from '.';

/**
 * A decorator that ensures only admins can execute the decorated method.
 * If the user is not an admin, a message is sent, and the execution is halted.
 */
export function OnlyAdminsCanUse() {
  return createDecorator(async (ctx, next, close) => {
    const reply = new BotReply(ctx);
    const chatInfo = new ChatInfo(ctx);

    try {
      const userIsAdmin = await chatInfo.userIsAdmin();

      if (!userIsAdmin) {
        await reply.textReply('Sorry, but you need to be an admin to use this command!');
        close();
        return;
      }
      return await next();
    } catch (error) {
      console.error('Error in OnlyAdminsCanUse decorator:', error);
      await reply.textReply('An unexpected error occurred. Please try again later.');
      close();
    }
  });
}
