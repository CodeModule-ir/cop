import { Bot } from 'grammy';
import type { Context } from 'grammy';
import { Catch } from '../decorators/ErrorHandlingDecorator';
import Config from '../config';
import { GenerateCommand } from './handlers/GenerateCommands';
import { GeneralCommands } from './commands/genearl/GeneralCommands';
import { ChatInfo } from '../utils/chat/ChatInfo';
import { UserCommands } from './commands/user/UserCommands';
import { forwardChannelPostToGroup } from './handlers/forward';
export class CopBot {
  private _bot: Bot<Context>;

  constructor() {
    this._bot = new Bot<Context>(Config.token);
  }
  start() {
    this._bot.start();
  }
  @Catch()
  async message(): Promise<void> {
    this._bot.on('message', async (ctx) => {
      const chatinfo = new ChatInfo(ctx);
      const message = chatinfo.message();
      const entity = chatinfo.entities();

      if (entity?.type === 'bot_command' && message?.text) {
        const lowerCaseCommand = message.text.toLowerCase().replace('/', '');
        const commandHandler = (GeneralCommands as any)[lowerCaseCommand];
        const commandUser = (UserCommands as any)[lowerCaseCommand];
        if (commandHandler && typeof commandHandler === 'function') {
          await commandHandler(ctx);
        } else if (commandHandler && typeof commandUser === 'function') {
          await commandUser(ctx);
        }
      }
    });
  }
  @Catch()
  async initial(): Promise<void> {
    new GenerateCommand(this._bot).generate();
    this.start();
    await this.message();
    await this.channel();
  }
  @Catch()
  async channel(): Promise<void> {
    this._bot.on('channel_post', async (ctx) => {
      forwardChannelPostToGroup(ctx);
    });
  }
}
