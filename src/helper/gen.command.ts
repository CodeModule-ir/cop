import { Bot, Context, NextFunction } from "grammy";
import { Command } from "../controller/command";
import { CmdValidator } from "../middleware";
export class GenerateCommand {
  private bot: Bot;
  static LIST_COMMAND: string[] = ["start", "help", "me", "warn", "clear","admins"];
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
      if (["start", "help", "me", "admins"].includes(command)) {
        this.create(command, (Command as any)[command]);
      } else {
        this.create(command, (Command as any)[command], CmdValidator.run);
      }
    }
  }
}
