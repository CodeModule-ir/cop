import { Context } from 'grammy';
import { logMessage } from '../service/loggingService';
export async function warnUser(ctx: Context) {
  logMessage(ctx.message);
  const repliedMessage = ctx.message?.reply_to_message;
  const warnWithUsername = ctx.message?.text?.split(' ')[1];
  if (warnWithUsername) {
    return await ctx.reply(
      `(${warnWithUsername}) has been warned.`,{
        reply_parameters:{
          message_id:ctx.message?.message_id!
        },
      });
  }
  if (ctx.me.id === repliedMessage?.from?.id) {
    return await ctx.reply("Why should I warn myself? You're an idiot!",{
      reply_parameters:{
        message_id:ctx.message?.message_id!
      },
    });
  }
  if (repliedMessage) {
    const replied =repliedMessage.from!;
    await ctx.reply(
      `${replied.first_name} (@${replied.username}) has been warned.`,{
        reply_parameters:{
          message_id:ctx.message?.message_id!
        },
      });
  } else {
    await ctx.reply('Please use this command in reply to a user\'s message.',{
      reply_parameters:{
        message_id:ctx.message?.message_id!
      },
    });
  }
}
