import { Bot } from 'grammy';
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
  // Stop the bot
  async stop(): Promise<void> {
    await this._bot.stop();
  }

  // Start the bot
  async start(): Promise<void> {
    const port = process.env.PORT || Config.port || 3000;
    const isProduction = Config.environment === 'production';
    const webhookURL = Config.web_hook || '';

    // Create a simple server for Render or similar platforms
    http
      .createServer((_, res) => {
        console.log('res;', res);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Bot is running');
      })
      .listen(port, () => {
        console.log(`Server running on port ${port}`);
      });

    if (isProduction) {
      console.log('Setting webhook...');
      try {
        await this._bot.api.getUpdates({ offset: -1 });
        await this._bot.api.setWebhook(webhookURL);
        console.log(`Webhook set to ${webhookURL}`);
        await this._bot.start({
          onStart: (botInfo) => {
            console.log(`Bot started in web-hook mode! Username: ${botInfo.username}`);
          },
        });
      } catch (err) {
        console.error('Failed to set webhook:', err);
        process.exit(1);
      }
    } else {
      console.log('Running in long-polling mode...');
      try {
        await this._bot.api.deleteWebhook();
        await this._bot.start({
          onStart: (botInfo) => {
            console.log(`Bot started in long-polling mode! Username: ${botInfo.username}`);
          },
        });
      } catch (err) {
        console.error('Error in long-polling mode:', err);
        process.exit(1);
      }
    }
  }
  @Catch()
  async initial(): Promise<void> {
    new GenerateCommand(this._bot).generate();
    this._bot.on('my_chat_member', (ctx) => this.handleJoinNewChat(ctx));
    this._bot.on('message', (ctx) => this.handleMessage(ctx));

    // Error handling
    this._bot.catch((err) => {
      console.error('Error in middleware:', err);
    });

    await this.start();
    console.log('Bot is running');
    new GenerateCommand(this._bot).generate();
  }
  @SaveUserData()
  @MessageValidator()
  @RateLimit({ commandLimit: 3, timeFrame: 15000 })
  @Catch()
  async handleMessage(ctx: Context) {
    console.log('ctx.message:', ctx.message);
    const messageText = ctx.message?.text?.toLowerCase().trim();
    const msg = ctx.message?.text!;
    const reply = new BotReply(ctx);
    const user = ctx.message?.reply_to_message?.from;
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
