import type { Express } from 'express';
import Config from '../config';
import * as express from 'express';
import { Bot, Context } from 'grammy';
export class WebHookService {
  private _app: Express;
  private _web_hook_url: string;
  private static _instance: WebHookService;
  private constructor(private _bot: Bot<Context>) {
    this._app = express();
    this._web_hook_url = `${Config.web_hook}/bot/${Config.token}`;
  }
  public static getInstance(bot: Bot<Context>): WebHookService {
    if (!WebHookService._instance) {
      WebHookService._instance = new WebHookService(bot);
    }
    return WebHookService._instance;
  }
  startServer() {
    try {
      const port = Config.port || 3000;
      this._app.listen(port, () => {
        console.log(`Server running on ${this._web_hook_url}`);
      });
    } catch (err) {
      console.error('Error starting server:', err);
    }
  }
  async initial() {
    this._app.use(express.json());
    this._app.post(`/bot/${Config.token}`, async (req, res) => {
      try {
        const update = req.body;
        await this._bot.handleUpdate(update);
        res.status(200).send('OK');
      } catch (err) {
        console.error('Error handling webhook:', err);
        res.status(500).send('Internal Server Error');
      }
    });
  }
  async setupWebHook() {
    try {
      await this._bot.api.deleteWebhook();
      const webhookInfo = await this._bot.api.getWebhookInfo();
      if (webhookInfo.url !== this._web_hook_url) {
        await this._bot.api.setWebhook(this._web_hook_url);
        console.log(`Webhook set to: ${this._web_hook_url}`);
      } else {
        console.log('Webhook already set.');
      }
    } catch (err) {
      console.error('Error setting up webhook:', err);
    }
  }
  async removeWebhook() {
    try {
      await this._bot.api.deleteWebhook();
      console.log('Webhook removed.');
    } catch (err) {
      console.error('Error removing webhook:', err);
    }
  }
}
