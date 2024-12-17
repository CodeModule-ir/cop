import { Bot } from 'grammy';
import { CommandName, COMMANDS } from '../../utils';
import { GeneralCommands } from '../../bot/commands/genearl/GeneralCommands';
import { UserCommands } from '../commands/user/UserCommands';
import { AdminCommands } from '../commands/admin/AdminCommands';
import logger from '../../utils/logger';
export class GenerateCommand {
  private bot: Bot;
  constructor(bot: Bot) {
    this.bot = bot;
  }

  private registerCommand(name: CommandName) {
    try {
      // Safely access the command handler from the appropriate module
      const generalCommandHandler = (GeneralCommands as any)[name];
      const userCommandHandler = (UserCommands as any)[name];
      const adminCommandHandler = (AdminCommands as any)[name];

      if (generalCommandHandler) {
        this.bot.command(name, generalCommandHandler.bind(GeneralCommands));
      } else if (userCommandHandler) {
        this.bot.command(name, userCommandHandler.bind(UserCommands));
      } else if (adminCommandHandler) {
        this.bot.command(name, adminCommandHandler.bind(AdminCommands));
      } else {
        logger.warn(`Command not found in any module: ${name}`);
      }
    } catch (error: any) {
      logger.error(`Error registering command "${name}": ${error.message}`);
    }
  }

  /**
   * Registers all commands defined in COMMANDS.
   */
  generate() {
    logger.info('Starting command generation.');
    try {
      COMMANDS.forEach((command) => {
        this.registerCommand(command);
      });
      logger.info('All commands have been registered successfully.');
    } catch (error: any) {
      logger.error(`Error during command generation: ${error.message}`);
    }
  }
}
