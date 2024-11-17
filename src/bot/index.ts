import { Bot, webhookCallback } from 'grammy';
import type { Context } from 'grammy';
import { Catch } from '../decorators/Catch';
import Config from '../config';
import { GenerateCommand } from './handlers/GenerateCommands';
import { GeneralCommands } from './commands/genearl/GeneralCommands';
import { ChatInfo } from '../utils/chat/ChatInfo';
import { UserCommands } from './commands/user/UserCommands';
import { ServiceProvider } from '../service/database/ServiceProvider';
import { AdminCommands } from './commands/admin/AdminCommands';
import { BotReply } from '../utils/chat/BotReply';
import { BotMiddleware } from './middleware/BotMiddleware';
import { MessagesService } from '../service/messages';
import * as http from 'http';
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
    try {
      const port = Config.port || 3000;
      const server = http.createServer(webhookCallback(this._bot, 'http'));
      server.listen(port, '0.0.0.0', () => {
        console.log(`Bot started on port ${port}`);
      });
      await this._bot.start({
        onStart: (botInfo) => {
          console.log(`Bot started successfully! Username: ${botInfo.username}`);
        },
      });
    } catch (error) {
      console.error('Error starting the bot:', error);
      process.exit(1); // Exit the process if the bot fails to start
    }
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
        await groupService.updateMembers(ctx.chat!.id!, ctx.from?.id!, ctx);
      }
      // Only process valid commands
      if (entity?.type === 'bot_command') {
        const lowerCaseCommand = message!.text!.toLowerCase().replace('/', '').split(' ')[0].trim();
        const commandGeneral = (GeneralCommands as any)[lowerCaseCommand];
        const commandUser = (UserCommands as any)[lowerCaseCommand];
        const commandAdmin = (AdminCommands as any)[lowerCaseCommand];
        if (commandGeneral && typeof commandGeneral === 'function') {
          await commandGeneral(ctx);
        } else if (commandUser && typeof commandUser === 'function') {
          const middlewarePassed = await this.applyMiddleware(ctx);
          if (middlewarePassed) {
            await commandUser(ctx);
          }
        } else if (commandAdmin && typeof commandAdmin === 'function') {
          const middlewarePassed = await this.applyMiddleware(ctx, false);
          if (middlewarePassed) {
            await commandAdmin(ctx);
          }
        }
      }
      const message_service = new MessagesService(ctx);
      await message_service.isNewUser();
      await message_service.isCode();
      await message_service.checkAndHandleBlacklistedWords();
      await message_service.userIsLeftGroup();
    });
  }
  async applyMiddleware(ctx: Context, isUserCommand: boolean = true): Promise<boolean> {
    // For user commands, check group chat, bot admin
    if (isUserCommand) {
      const groupChatCheck = await BotMiddleware.isGroupChat(ctx, null, false);
      if (!groupChatCheck) return false; // Return early if group chat check fails

      const botAdminCheck = await BotMiddleware.botIsAdmin(ctx, null, false);
      if (!botAdminCheck) return false; // Return early if bot admin check fails

      return true;
    }

    // For admin commands, check group chat, bot admin, user admin, and admin check for replied user
    else {
      const groupChatCheck = await BotMiddleware.isGroupChat(ctx, null, false);
      if (!groupChatCheck) return false; // Return early if group chat check fails

      const botAdminCheck = await BotMiddleware.botIsAdmin(ctx, null, false);
      if (!botAdminCheck) return false; // Return early if bot admin check fails

      const userAdminCheck = await BotMiddleware.userIsAdmin(ctx, null, false);
      if (!userAdminCheck) return false; // Return early if user admin check fails

      const adminCheckForReplied = await BotMiddleware.adminCheckForRepliedUser(ctx, null, false);
      if (!adminCheckForReplied) return false; // Return early if admin check for replied user fails

      return true;
    }
  }
  @Catch()
  async initial(): Promise<void> {
    new GenerateCommand(this._bot).generate();
    await this.start();
    await this.message();
  }
}
