import { Bot } from 'grammy';
import type { Context } from 'grammy';
import { Catch } from '../decorators/Catch';
import Config from '../config';
import { GenerateCommand } from './handlers/GenerateCommands';
import { GeneralCommands } from './commands/genearl/GeneralCommands';
import { UserCommands } from './commands/user/UserCommands';
import { AdminCommands } from './commands/admin/AdminCommands';
import { SaveUserData } from '../decorators/Database';
import { MessageValidator } from '../decorators/Context';
import { BotReply } from '../utils/chat/BotReply';
import { WebHookService } from '../service/WebHook';
export class CopBot {
  private static instance: CopBot;
  private _bot: Bot<Context>;
  private constructor() {
    this._bot = new Bot<Context>(Config.token, { client: { timeoutSeconds: 20 } });
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
    const startBot = async (mode: string) => {
      await this._bot.start({
        onStart: (botInfo) => {
          console.log(`Bot started in ${mode} mode! Username: ${botInfo.username}`);
        },
      });
    };
    const isProduction = Config.environment === 'production';
    const webhookURL = `${Config.web_hook}/bot/${Config.token}`;
    const mode = isProduction ? 'webhook' : 'long-polling';
    console.log(`Environment: ${Config.environment}`);
    console.log(`Web hook Url: ${webhookURL}`);
    console.log(`Running in ${isProduction ? 'webhook' : 'long-polling'} mode`);
    if (isProduction) {
      console.log('Setting webhook...');
      try {
        console.log('Setting up webhook...');
        const _webhookService = WebHookService.getInstance(this._bot);
        await _webhookService.setupWebHook();
        _webhookService.startServer();
        const webhookInfo = await this._bot.api.getWebhookInfo();
        console.log(`Bot started in webhook mode`);
        console.log('webhookInfo', webhookInfo);
      } catch (err) {
        console.error('Error setting up webhook:', err);
        process.exit(1);
      }
    } else {
      console.log('Running in long-polling mode...');
      try {
        await this._bot.api.deleteWebhook();
        await startBot(mode);
      } catch (err) {
        console.error('Error in long-polling mode:', err);
        process.exit(1);
      }
    }
  }
  @Catch()
  async initial(): Promise<void> {
    await this._bot.init();
    await this.start();
    console.log('Bot is running');
    new GenerateCommand(this._bot).generate();
    this._bot.on('my_chat_member', (ctx) => this.handleJoinNewChat(ctx));
    this._bot.on('message', (ctx) => this.handleMessage(ctx));

    // Error handling
    this._bot.catch((err) => {
      console.error('Error in middleware:', err);
    });
  }
  @SaveUserData()
  @MessageValidator()
  @Catch()
  async handleMessage(ctx: Context) {
    console.log('ctx.message.text:', ctx.message?.text);
    console.log('ctx.message.from:', ctx.message?.from);
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
    const botCommand = ctx.message?.entities?.[0].type === 'bot_command';
    if (botCommand && command) {
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
