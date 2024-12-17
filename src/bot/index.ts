import { Bot, webhookCallback, BotError } from 'grammy';
import type { Context } from 'grammy';
import Config from '../config';
import { GenerateCommand } from './handlers/GenerateCommands';
import { SaveUserData } from '../decorators/Database';
import { MessageValidator } from '../decorators/Context';
import * as express from 'express';
import { BotReply } from '../utils/chat/BotReply';
import logger from '../utils/logger';
import { limit } from '@grammyjs/ratelimiter';
import { ServiceProvider } from '../service/database/ServiceProvider';
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
    const startBot = async (mode: string) => {
      await this._bot.start({
        drop_pending_updates: true,
        timeout: 60,
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
        app.post(webhookPath, async (req, res) => {
          res.sendStatus(200);
          try {
            await webhookCallback(this._bot, 'express')(req, res);
          } catch (error: any) {
            logger.error(`Error processing update : ${error.message}`);
            return;
          }
        });
        app.get('/health', async (_, res) => {
          try {
            const isHealthy = await ServiceProvider.getInstance().healthCheck();
            if (isHealthy) {
              res.status(200).send('Database is healthy');
              logger.info('Database connection is healthy.');
            } else {
              res.status(500).send('Database not reachable');
              logger.error('Database not reachable.');
            }
          } catch (error: any) {
            res.status(500).send('Database connection error');
            logger.error(`Database health check failed: ${error.message}`);
          }
        });
        const port = process.env.PORT || 3000;
        app.listen(port, async () => {
          logger.info(`Webhook server running on port ${port}`);
          let webhookInfo = await this._bot.api.getWebhookInfo();
          logger.info(`Current Webhook: ${webhookInfo.url}`);
          const MAX_RETRIES = 5;
          let retries = 0;

          const trySetWebhook = async () => {
            try {
              if (!webhookInfo.url) {
                logger.warn('Webhook is not set. Trying to set the webhook...');
                await this._bot.api.setWebhook(webhookURL, { drop_pending_updates: true });
                webhookInfo = await this._bot.api.getWebhookInfo();
                logger.info(`Webhook set: ${webhookInfo.url}`);
              } else {
                logger.info('Webhook is already set.');
              }
            } catch (error: any) {
              retries++;
              logger.error(`Error setting webhook (Attempt ${retries}): ${error.message}`);
              if (retries < MAX_RETRIES) {
                const delay = Math.min(1000 * 2 ** retries, 30000); // Exponential backoff
                logger.warn(`Retrying in ${delay / 1000} seconds...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                await trySetWebhook();
              } else {
                logger.error('Max retries reached. Could not set webhook.');
                process.exit(1); // Exit after maximum retries reached
              }
            }
          };

          await trySetWebhook();
          await startBot(mode);
        });
      } catch (err: any) {
        console.error('Error setting up webhook:', err);
        process.exit(1);
      }
    } else {
      try {
        await startBot(mode);
      } catch (err: any) {
        console.error('Error during long-polling mode:', err);
        process.exit(1);
      }
    }
  }
  async initial(): Promise<void> {
    new GenerateCommand(this._bot).generate();
    this._bot.use(
      limit({
        onLimitExceeded: (ctx) => ctx.reply('Too many requests! Please slow down.'),
      })
    );
    this._bot.on('my_chat_member', (ctx) => this.handleJoinNewChat(ctx));
    this._bot.on('message', (ctx) => this.handleMessage(ctx));
    this._bot.catch(async (error: BotError<Context>) => {
      if (error.message.includes('timeout')) {
        await error.ctx.reply('The request took too long to process. Please try again later.');
      }
      logger.error(`Bot error occurred: ${error.error}`);
    });
    await this.start();
    logger.info('Bot is running');
  }
  @MessageValidator()
  @SaveUserData()
  async handleMessage(ctx: Context) {}
  @SaveUserData()
  async handleJoinNewChat(ctx: Context) {
    if (!ctx.message?.text) {
      console.warn('Message text is undefined');
      return;
    }
    const chat = ctx.chat!;
    if (!chat) {
      return;
    }
    const reply = new BotReply(ctx);
    const from = ctx.from;
    const message = `
      Hello ${ctx.chat?.title}!
First of all, thanks to @${from?.username!} for inviting me to this awesome group!
I'm here to help out and make sure everyone has a good time. Are you curious about what I can do? Just type the /help command.
    `;
    await reply.textReply(message);
    return;
  }
}
