import { Bot, webhookCallback } from 'grammy';
import type { Context } from 'grammy';
import { Catch } from '../decorators/Catch';
import Config from '../config';
import { GenerateCommand } from './handlers/GenerateCommands';
import { GeneralCommands } from './commands/genearl/GeneralCommands';
import { UserCommands } from './commands/user/UserCommands';
import { AdminCommands } from './commands/admin/AdminCommands';
import * as http from 'http';
import { SaveUserData } from '../decorators/Database';
import { MessageValidator, RateLimit } from '../decorators/Context';
import { BotReply } from '../utils/chat/BotReply';
export class CopBot {
  private static instance: CopBot;
  private _bot: Bot<Context>;

  private constructor() {
    this._bot = new Bot<Context>(Config.token);
  }
  // Public method to get the singleton instance of CopBot
  public static getInstance(): CopBot {
    if (!CopBot.instance) {
      CopBot.instance = new CopBot();
    }
    return CopBot.instance;
  }
  async start() {
    const port = Config.port || 3000;
    const web_hook = Config.web_hook;
    const isProduction = Config.environment === 'production';
    if (isProduction) {
      const server = http.createServer(webhookCallback(this._bot, 'http'));
      server.listen(port, '0.0.0.0', () => {
        console.log(`Bot started on port ${port}`);
      });
      await this._bot.api.setWebhook(`${web_hook}`);
      console.log(`Webhook set successfully to: ${web_hook}`);
      await this._bot.start({
        onStart: (botInfo) => {
          console.log(`Bot started in web-hook mode! Username: ${botInfo.username}`);
        },
      });
    } else {
      try {
        await this._bot.api.getUpdates({ offset: -1 });
        await this._bot.start({
          onStart: (botInfo) => {
            console.log(`Bot started in long-polling mode! Username: ${botInfo.username}`);
          },
        });
      } catch (error) {
        console.error('Error starting bot in long-polling mode:', error);
        process.exit(1);
      }
    }
  }
  @Catch()
  async initial(): Promise<void> {
    new GenerateCommand(this._bot).generate();
    this._bot.on('my_chat_member', (ctx) => this.handleJoinNewChat(ctx));
    this._bot.on('message', (ctx) => this.handleMessage(ctx));
    await this.start();
    this._bot.catch((err) => {
      console.error('Error in middleware:', err);
    });
    console.log('Bot Is Start');
  }
  @SaveUserData()
  @MessageValidator()
  @RateLimit({ commandLimit: 3, timeFrame: 15000 })
  @Catch()
  async handleMessage(ctx: Context) {
    const messageText = ctx.message?.text?.toLowerCase().trim();
    const msg = ctx.message?.text!;
    const reply = new BotReply(ctx);
    const user = ctx.message?.reply_to_message!.from;
    if (msg && msg.toLowerCase() === 'ask' && user) {
      const name = user.username ? `@${user.username}` : user.first_name;
      const responseMessage = `Dear ${name}, ask your question correctly.\nIf you want to know how to do this, read the article below:\ndontasktoask.ir`;
      await reply.textReply(responseMessage);
    }
    const command = messageText?.split(' ')[0]?.replace('/', '');
    if (command) {
      const handler = (GeneralCommands as any)[command] || (UserCommands as any)[command] || (AdminCommands as any)[command];
      if (typeof handler === 'function') {
        await handler(ctx);
      }
    }
  }

  @SaveUserData()
  async handleJoinNewChat(ctx: Context) {
    const chat = ctx.chat!;
    if (!chat) {
      return;
    }
    const msg = ctx.message?.text!;
    if (msg === '/start') {
      console.log('Start command received');
    }
    const reply = new BotReply(ctx);
    const from = ctx.from;
    console.log(`Bot added to group ${chat.title} by ${from?.username}`);
    const message = `
      Hello ${ctx.chat?.title}!
First of all, thanks to @${from?.username!} for inviting me to this awesome group!
I'm here to help out and make sure everyone has a good time. Are you curious about what I can do? Just type the /help command.
    `;
    await reply.textReply(message);
  }
}
