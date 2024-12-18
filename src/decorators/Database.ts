import { ServiceProvider } from '../service/database/ServiceProvider';
import { createDecorator } from '.';
import { Context } from 'grammy';

export function SaveUserData() {
  return createDecorator(async (ctx, next, close) => {
    const databaseService = ServiceProvider.getInstance();
    const [userService, groupService] = await Promise.all([databaseService.getUserService(), databaseService.getGroupService()]);
    if (!userService || !groupService) {
      close();
      return;
    }
    const userData = {
      first_name: ctx.from?.first_name!,
      id: ctx.from?.id!,
      username: ctx.from?.username!,
    };
    if (ctx.chat!.type === 'group' || ctx.chat!.type === 'supergroup') {
      await userService.save(userData);
      await groupService.save(ctx);
      await groupService.updateMembers(ctx.chat!.id, ctx.from?.id!, ctx);
    } else {
      await userService.save(userData);
    }
    await next();
  });
}
export function EnsureUserAndGroup(userSource: 'from' | 'reply' = 'reply') {
  return createDecorator(async (ctx: Context, next, close) => {
    try {
      const service = ServiceProvider.getInstance();
      const userContext = userSource === 'reply' && ctx.message?.reply_to_message?.from && !ctx.message.reply_to_message.forum_topic_created ? ctx.message.reply_to_message.from : ctx.from;
      const userId = userContext?.id;
      const groupId = ctx.chat?.id;
      if (!userId || !groupId) {
        console.error('User ID or Group ID is missing.');
        close();
        return;
      }
      const userData = {
        first_name: userContext!.first_name!,
        id: userId,
        username: userContext!.username!,
      };
      await Promise.all([
        service.getUserService().then((userService) => {
          if (!userService) {
            console.error('UserService is unavailable.');
            close();
            return;
          }
          userService.save(userData);
        }),
        service.getGroupService().then((groupService) => {
          if (!groupService) {
            close();
            return;
          }
          groupService.save(ctx);
        }),
      ]);
      await next();
    } catch (error) {
      console.error('Error in EnsureUserAndGroup decorator:', error);
      close();
    }
  });
}
