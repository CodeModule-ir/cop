import { Bot } from 'grammy';
import type { Context } from 'grammy';
import { Catch } from '../decorators/Catch';
import Config from '../config';
import { GenerateCommand } from './handlers/GenerateCommands';
import { GeneralCommands } from './commands/genearl/GeneralCommands';
import { ChatInfo } from '../utils/chat/ChatInfo';
import { UserCommands } from './commands/user/UserCommands';
import { forwardChannelPostToGroup } from './handlers/forward';
import { ServiceProvider } from '../service/database/ServiceProvider';
import { AdminCommands } from './commands/admin/AdminCommands';
import { BotReply } from '../utils/chat/BotReply';
export class CopBot {
  private _bot: Bot<Context>;

  constructor() {
    this._bot = new Bot<Context>(Config.token);
  }
  async start() {
    await this._bot.api.getUpdates({ offset: -1 });
    this._bot.start();
  }
  @Catch()
  async message(): Promise<void> {
    this._bot.on('message', async (ctx) => {
      const reply = new BotReply(ctx);
      if (!ctx.message) {
        await reply.textReply('No message context found. Unable to process the command.');
        return;
      }
      const chatinfo = new ChatInfo(ctx);
      const message = chatinfo.message();
      const entity = chatinfo.entities();
      const datanaseService = ServiceProvider.getInstance();
      // Save user and group info only for specific message types
      const [userService, groupService] = await Promise.all([datanaseService.getUserService(), datanaseService.getGroupService()]);
      const userData = { first_name: ctx!.from.first_name!, id: ctx.from.id!, username: ctx.from.username! };
      await userService.save(userData);
      if (ctx.chat.type === 'group' || (ctx.chat.type === 'supergroup' && ctx.chat.id)) {
        await groupService.save(ctx);
        await groupService.updateMembers(ctx.chat!.id!, ctx.from?.id!);
      }
      // Only process valid commands
      if (entity?.type === 'bot_command' && message?.text) {
        const lowerCaseCommand = message.text.toLowerCase().replace('/', '');
        const commandGeneral = (GeneralCommands as any)[lowerCaseCommand];
        const commandUser = (UserCommands as any)[lowerCaseCommand];
        const commandAdmin = (AdminCommands as any)[lowerCaseCommand];
        if (commandGeneral && typeof commandGeneral === 'function') {
          await commandGeneral(ctx);
        } else if (commandUser && typeof commandUser === 'function') {
          await commandUser(ctx);
        } else if (commandAdmin && typeof commandAdmin === 'function') {
          await commandAdmin(ctx);
        }
      }
    });
  }
  async initial(): Promise<void> {
    new GenerateCommand(this._bot).generate();
    await this.start();
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
