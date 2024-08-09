import { Context } from "grammy";
import { MESSAGE } from "../helper/message";
import { SafeExecution } from "../decorators/SafeExecution";
import { COMMANDS } from "../helper";
import { AdminCommand } from "../group-management/AdminCommand";
import { Logger } from "../config/logger";
import { RateLimiter } from "../helper/RateLimiter";
import { initGroupSetting } from "../decorators/db";
const logger = new Logger({
  file: "command.log",
  level: "debug",
  timestampFormat: "locale",
});

export class Command {
  @SafeExecution()
  static start(ctx: Context) {
    if (ctx.chat?.type === "private") {
      return ctx.reply(MESSAGE.PV_START());
    }
    return ctx.reply(MESSAGE.START(), {
      reply_parameters: {
        message_id: ctx.message?.message_id!,
      },
    });
  }
  @SafeExecution()
  static help(ctx: Context) {
    if (ctx.chat?.type === "private") {
      return ctx.reply(MESSAGE.HELP());
    }
    return ctx.reply(MESSAGE.HELP(), {
      parse_mode: "Markdown",
      reply_parameters: {
        message_id: ctx.message?.message_id!,
      },
    });
  }
  @SafeExecution()
  static async shahin(ctx: Context) {
    await ctx.reply("دوستان.");
    setTimeout(() => {
      return ctx.reply("بحث تخصصی.");
    }, 2500);
  }
  @SafeExecution()
  static future(ctx: Context) {
    return ctx.reply("We will go to ga", {
      reply_parameters: {
        message_id: ctx.message?.message_id!,
      },
    });
  }

  @SafeExecution()
  @initGroupSetting()
  static async handleCommand(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;
    if (!userId) return;
    if (!RateLimiter.limit(userId)) {
      logger.debug(`Rate limit exceeded for user: ${userId}`, "RATE_LIMIT");
      return;
    }
    const command = ctx.message?.text?.split("/")[1]?.split(/[\s@]/)[0];
    logger.info(`Received command: ${command}`, "COMMAND");

    if (command && (Command as any)[command]) {
      await (Command as any)[command](ctx);
    } else {
      await ctx.reply("Unknown command.", {
        reply_to_message_id: ctx.message?.message_id,
      });
    }
  }

  // This method is now called only once, during initialization
  static generate() {
    for (const command of COMMANDS) {
      const adminCommandMethod = (AdminCommand as any)[command];
      if (adminCommandMethod) {
        (Command as any)[command] = adminCommandMethod.bind(AdminCommand);
      }
    }
  }
}
Command.generate();
