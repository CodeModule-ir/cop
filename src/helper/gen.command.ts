import { Bot, Context, NextFunction } from "grammy";
import { Command } from "../controller/command";
import { CmdValidator } from "../middleware";
export class GenerateCommand {
  private bot: Bot;
  static COMMANDS: string[] = ["start", "help", "me", "warn", "unWarn","admins","mute","unMute"];
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
   * Generates and registers all commands defined in COMMANDS.
   */
  generate() {
    for (const command of GenerateCommand.COMMANDS) {
      const nameLower = command.toLowerCase();
      if (["start", "help", "me", "admins"].includes(nameLower)) {
        // Register the command for both lowercase and uppercase variants
        this.create(nameLower, (Command as any)[command]);
        this.create(nameLower.toUpperCase(), (Command as any)[command]);
      } else {
        this.create(nameLower || command, (Command as any)[command], CmdValidator.run);
        this.create(nameLower.toUpperCase(), (Command as any)[command], CmdValidator.run);
      }
    }
  }
}
