import { Bot, Context, NextFunction } from "grammy";
import { Command } from "../controller/command";
import { CmdValidator } from "../middleware";
export class GenerateCommand {
  private bot: Bot;
  static LIST_COMMAND: string[] = ["start", "help", "me", "warn", "unWarn","admins"];
  constructor(bot: Bot) {
    this.bot = bot;
  }
  private create(
    name: string,
    fn: (ctx: Context) => void | Promise<void>,
    mid?: (ctx: Context, next: NextFunction) => Promise<void>
  ) {
    if (mid) {
      this.bot.command(name, mid, fn);
    } else {
      this.bot.command(name, fn);
    }
  }
  /**
   * Generates and registers all commands defined in LIST_COMMAND.
   */
  generate() {
    for (const command of GenerateCommand.LIST_COMMAND) {
      const commandNameLower = command.toLowerCase();

      if (["start", "help", "me", "admins"].includes(commandNameLower)) {
        // Register the command for both lowercase and uppercase variants
        this.create(commandNameLower, (Command as any)[command]);
        this.create(commandNameLower.toUpperCase(), (Command as any)[command]);
      } else {
        this.create(commandNameLower, (Command as any)[command], CmdValidator.run);
        this.create(commandNameLower.toUpperCase(), (Command as any)[command], CmdValidator.run);
      }
    }
  }
}
