import { Bot, Context, NextFunction } from "grammy";
import { Command } from "../../controller/command";
import { CmdMid } from "../../middleware";
import { botIsAdmin } from "../../middleware/isAdmin";
import { COMMANDS } from "../../helper";
export class GenerateCommand {
  private bot: Bot;
  constructor(bot: Bot) {
    this.bot = bot;
  }
  private create(name: string, mids?: ((ctx: Context, next: NextFunction) => Promise<void>)[]) {
    const middleware = mids ? this.compose(mids) : undefined;
    if (middleware) {
      this.bot.command(name, middleware, botIsAdmin, Command.handleCommand);
    } else {
      this.bot.command(name, Command.handleCommand);
    }
  }

  private compose(
    middlewares: ((ctx: Context, next: NextFunction) => Promise<void>)[]
  ): (ctx: Context, next: NextFunction) => Promise<void> {
    return async (ctx: Context, next: NextFunction) => {
      let index = -1;

      const dispatch: any = async (i: number) => {
        if (i <= index) {
          throw new Error("next() called multiple times");
        }
        index = i;
        const fn = middlewares[i];
        if (i === middlewares.length) {
          return next();
        }
        if (!fn) {
          return next();
        }
        return fn(ctx, () => dispatch(i + 1));
      };

      return dispatch(0);
    };
  }

  /**
   * Generates and registers all commands defined in COMMANDS.
   */
  generate() {
    for (const command of COMMANDS) {
        if (["start", "help", "date", "future",].includes(command)) {
            this.create(command);
        } else if (["rules", "shahin","aran"].includes(command)) {
            this.create(command, [CmdMid.isValidChatType]);
        } else if (["lock", "blacklist", "abl", "unLock", "rmbl", "approvedList","codeTime"].includes(command)) {
            this.create(command, [CmdMid.isValidChatType, CmdMid.AdminStatus]);
        } else if (["purge"].includes(command)) {
            this.create(command, [CmdMid.isValidChatType, CmdMid.isReplied, CmdMid.AdminStatus]);
        } else if (["unBan"].includes(command)) {
            this.create(command, [
                CmdMid.isValidChatType,
                CmdMid.isReplied,
                CmdMid.AdminStatus,
                CmdMid.adminCheckForRepliedUser,
            ]);
        } else {
            this.create(command, [
                CmdMid.isValidChatType,
                CmdMid.userInGroup,
                CmdMid.isReplied,
                CmdMid.AdminStatus,
                CmdMid.adminCheckForRepliedUser,
            ]);
        }
    }
}

}
