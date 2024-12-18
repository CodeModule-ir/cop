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
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isProduction = Config.environment === 'production';
  private webhookPath = `/bot/${Config.token}`;
  private webhookURL = `${Config.web_hook}${this.webhookPath}`;
  private mode = this.isProduction ? 'webhook' : 'long-polling';
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
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    await this._bot.stop();
  }

  // Start the bot
  async start(): Promise<void> {
    const startBot = async (mode: string) => {
      await this._bot.start({
        drop_pending_updates: true,
        timeout: 300,
        onStart: (botInfo) => {
          logger.info(`Bot started in ${mode} mode! Username: ${botInfo.username}`);
        },
      });
    };
    logger.info(`Environment: ${Config.environment}`);
    logger.info(`Webhook URL: ${this.webhookURL}`);
    logger.info(`Running in ${this.mode} mode`);

    if (this.isProduction) {
      try {
        const app = express();
        app.use(express.json());
        app.post(this.webhookPath, async (req, res) => {
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
          await this.setupWebhook(this.webhookURL);
          await startBot(this.mode);
        });
      } catch (err: any) {
        console.error('Error setting up webhook:', err);
        process.exit(1);
      }
    } else {
      try {
        await startBot(this.mode);
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
        await this.start();
      }
      logger.error(`Bot error occurred: ${error.error}`);
    });
    await this.start();
    // Set up periodic health checks and keep-alives
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this._bot.api.getMe(); // Ping Telegram to keep the connection alive
        const isHealthy = await ServiceProvider.getInstance().healthCheck();
        if (!isHealthy) {
          logger.warn('Database health check failed. Attempting to reconnect...');
          await ServiceProvider.initialize();
        }
        const webhookInfo = await this._bot.api.getWebhookInfo();
        if (!webhookInfo.url || webhookInfo.url !== this.webhookURL) {
          logger.warn('Webhook mismatch detected. Resetting webhook...');
          await this.setupWebhook(this.webhookURL);
        }
        logger.info('Health check passed: Bot is live');
      } catch (error: any) {
        logger.error(`Health check failed: ${error.message}`);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
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
  private async setupWebhook(webhookURL: string): Promise<void> {
    const MAX_RETRIES = 5;
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        // Delete existing webhook to ensure a clean state
        await this._bot.api.deleteWebhook({ drop_pending_updates: true });

        // Set the new webhook
        const setWebhookResponse = await this._bot.api.setWebhook(webhookURL, { drop_pending_updates: true });
        logger.info(`Set Webhook Response: ${JSON.stringify(setWebhookResponse, null, 2)}`);

        // Verify webhook was set
        const webhookInfo = await this._bot.api.getWebhookInfo();
        logger.info(`Webhook Info: ${JSON.stringify(webhookInfo, null, 2)}`);

        if (webhookInfo.url === webhookURL) {
          logger.info('Webhook set successfully.');
          return;
        } else {
          logger.warn(`Webhook URL mismatch. Expected: ${webhookURL}, Got: ${webhookInfo.url}`);
        }
      } catch (error: any) {
        retries++;
        logger.error(`Error setting webhook (Attempt ${retries}): ${error.message}`);
        if (retries === MAX_RETRIES) {
          logger.error('Max retries reached. Could not set webhook.');
          process.exit(1);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** retries));
      }
    }
  }
}
