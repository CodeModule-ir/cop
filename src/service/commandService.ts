import { Context } from 'grammy';
let msg = 'Hello! I’m CMCOP, your friendly group management assistant. Use /help to see what I can do!'
const helpMessage = `
Welcome to **CMCOP** Here are the commands you can use:

  - /start: Start interacting with the bot and receive a welcome message.
  - /help: Get assistance and see the list of available commands.
  - /warn [user]: Issue a warning to a user.
  - /mute [user] [time]: Mute a user for a specified time.
  - /ban [user]: Ban a user from the group.
  - /admins: List all admins in the chat.
  - /addcommand [command] [response]: Add a custom command.
`;
export async function startCommand(ctx: Context) {
  if (ctx.chat?.type === 'private') {
    return ctx.reply(msg);
  }
  return ctx.reply(msg,{
      reply_parameters:{
        message_id:ctx.message?.message_id!
      },
    });
}
export async function helpCommand(ctx: Context) {
  if (ctx.chat?.type === 'private') {
    return ctx.reply(helpMessage,{parse_mode:"Markdown"});
  }
  return ctx.reply(helpMessage,{
    parse_mode:"Markdown",
    reply_parameters:{
      message_id:ctx.message?.message_id!
    },
  });
}
