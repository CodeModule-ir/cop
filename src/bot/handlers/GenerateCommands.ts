import { Bot } from 'grammy';
import { CommandName, COMMANDS } from '../../utils';
import { GeneralCommands } from '../../bot/commands/genearl/GeneralCommands';
import { UserCommands } from '../commands/user/UserCommands';
import { AdminCommands } from '../commands/admin/AdminCommands';
import { BotMiddleware } from '../middleware/BotMiddleware';
export class GenerateCommand {
  private bot: Bot;
  constructor(bot: Bot) {
    this.bot = bot;
  }

  private registerCommand(name: CommandName) {
    // Safely access the command handler on GeneralCommands
    const generalCommandHandler = (GeneralCommands as any)[name];
    const userCommandHandler = (UserCommands as any)[name];
    const adminCommandsHandler = (AdminCommands as any)[name];
    if (generalCommandHandler) {
      this.bot.command(name, generalCommandHandler.bind(GeneralCommands));
    } else if (userCommandHandler) {
      this.bot.command(name, BotMiddleware.isGroupChat, BotMiddleware.botIsAdmin, userCommandHandler.bind(UserCommands));
    } else if (adminCommandsHandler) {
      this.bot.command(name, BotMiddleware.isGroupChat, BotMiddleware.botIsAdmin, BotMiddleware.userIsAdmin, BotMiddleware.adminCheckForRepliedUser, adminCommandsHandler.bind(AdminCommands));
    }
  }

  /**
   * Registers all commands defined in COMMANDS.
   */
  generate() {
    COMMANDS.forEach((command) => this.registerCommand(command));
  }
}
