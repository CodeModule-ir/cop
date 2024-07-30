import { Context, NextFunction } from 'grammy';
import { isUserAdmin } from '../helper/helper';

export async function checkAdmin(ctx: Context, next: NextFunction) {
  const userId = ctx.message?.from?.id;
  if (userId && (await isUserAdmin(ctx, userId))) {
    return next();
  } else {
    await ctx.reply('You need to be an admin to use this command.');
  }
}
