import { Bot, webhookCallback } from 'grammy';
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
import logger from '../utils/logger';
import * as express from 'express';
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
          logger.info(`Bot started in ${mode} mode! Username: ${botInfo.username}`);
        },
      });
    };

    const isProduction = Config.environment === 'production';
    const webhookPath = `/bot/${Config.token}`;
    const webhookURL = `${Config.web_hook}${webhookPath}`;
    const mode = isProduction ? 'webhook' : 'long-polling';

    logger.info(`Environment: ${Config.environment}`);
    logger.info(`Webhook URL: ${webhookURL}`);
    logger.info(`Running in ${mode} mode`);

    if (isProduction) {
      try {
        const app = express();
        app.use(express.json());

        app.post(webhookPath, webhookCallback(this._bot, 'express'));

        const port = process.env.PORT || 3000;
        app.listen(port, async () => {
          logger.info(`Webhook server running on port ${port}`);
          await this._bot.api.setWebhook(webhookURL);
          const webhookInfo = await this._bot.api.getWebhookInfo();
          logger.info(`Webhook set: ${webhookInfo.url}`);
        });
      } catch (err) {
        logger.error('Error setting up webhook:' + err);
        process.exit(1);
      }
    } else {
      try {
        await this._bot.api.deleteWebhook();
        await startBot(mode);
      } catch (err) {
        logger.error('Error during long-polling mode:' + err);
        process.exit(1);
      }
    }
  }
  async initial(): Promise<void> {
    new GenerateCommand(this._bot).generate();
    this._bot.on('my_chat_member', (ctx) => this.handleJoinNewChat(ctx));
    this._bot.on('message', (ctx) => this.handleMessage(ctx));

    this._bot.catch((err) => {
      logger.error('Middleware error:' + err);
    });

    await this.start();
    logger.info('Bot is running');
  }
  @SaveUserData()
  @MessageValidator()
  async handleMessage(ctx: Context) {
    console.log('ctx.message.text:', ctx.message?.text);
    console.log('ctx.chat', ctx.chat);
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
    if (command && ctx.message?.entities?.[0].type === 'bot_command') {
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
