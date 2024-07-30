import { Context } from "grammy";
import { warnUser } from "../service/warning";

export async function warnUserCommand(ctx: Context) {
  const repliedMessage = ctx.message?.reply_to_message;
  const warnWithUsername = ctx.message?.text?.split(" ")[1];

  if (warnWithUsername) {
    const userId = repliedMessage?.from?.id;
    const username = repliedMessage?.from?.username;
    if (userId && username) {
      const warning = await warnUser(userId, username, ctx);
      if (warning) {
        return await ctx.reply(
          `(${warnWithUsername}) has been warned. Total warnings: ${warning.warning_count}.`,
          { reply_to_message_id: ctx.message?.message_id }
        );
      }
      return; 
    }
  }

  if (ctx.me.id === repliedMessage?.from?.id) {
    return await ctx.reply("Why should I warn myself? You're an idiot!", {
      reply_to_message_id: ctx.message?.message_id,
    });
  }

  if (repliedMessage) {
    const replied = repliedMessage.from!;
    const warning = await warnUser(replied.id, replied.username!, ctx);
    if (warning) {
      await ctx.reply(
        `${replied.first_name} (@${replied.username}) has been warned. Total warnings: ${warning.warning_count}.`,
        { reply_to_message_id: ctx.message?.message_id }
      );
    }
    return; // User was banned and removed, no need to reply further
  } else {
    await ctx.reply("Please use this command in reply to a user's message.", {
      reply_to_message_id: ctx.message?.message_id,
    });
  }
}
