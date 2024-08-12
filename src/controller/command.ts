import { Context } from "grammy";
import { MESSAGE } from "../helper/message";
import { SafeExecution } from "../decorators/SafeExecution";
import { COMMANDS, ReplyBuilder } from "../helper";
import { AdminCommand } from "../group-management/AdminCommand";
import { Logger } from "../config/logger";
import { RateLimiter } from "../helper/RateLimiter";
import { initGroupSetting } from "../decorators/db";
import * as roastMessages from "../helper/roast.json";
import { RoastMessages } from "../types";

const logger = new Logger({
  file: "command.log",
  level: "debug",
  timestampFormat: "locale",
});

export class Command {
  private static aranState: Map<number, number> = new Map();

  @SafeExecution()
  static start(ctx: Context) {
    return new ReplyBuilder(ctx).sendReply(MESSAGE.PV_START(), MESSAGE.START());
  }
  @SafeExecution()
  static help(ctx: Context) {
    return new ReplyBuilder(ctx).sendReply(
      MESSAGE.HELP(),
      MESSAGE.HELP(),
      "Markdown"
    );
  }
  @SafeExecution()
  static async shahin(ctx: Context) {
    await ctx.reply("دوستان.");
    setTimeout(() => {
      return ctx.reply("بحث تخصصی.");
    }, 2000);
  }
  @SafeExecution()
  static future(ctx: Context) {
    return new ReplyBuilder(ctx).sendReply(
      "We will go to ga",
      "We will go to ga"
    );
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
  @SafeExecution()
  static async aran(ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId) return;

    const currentState = Command.aranState.get(userId) || 0;

    switch (currentState) {
      case 0:
        await ctx.reply("Aran mode: Activated.");
        Command.aranState.set(userId, 1);
        break;
      case 1:
        await ctx.reply("رفرنس بده.");
        Command.aranState.set(userId, 2);
        break;
      case 2:
        await ctx.reply("Aran mode: deActivated.");
        Command.aranState.set(userId, 0);
        break;
      default:
        Command.aranState.set(userId, 0);
        break;
    }
  }
  @SafeExecution()
  static async codeTime(ctx: Context) {
    const user = ctx.from;
    if (!user) return;
    const replyBuilder = new ReplyBuilder(ctx);

    const targetUser = ctx.message?.reply_to_message?.from;

    const randomHours = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    // Function to get a random message from the appropriate category
    const getRandomMessage = (category: keyof RoastMessages) => {
      const messages = roastMessages[category];
      const randomIndex = Math.floor(Math.random() * messages.length);
      return messages[randomIndex];
    };

    if (targetUser?.id === ctx.me?.id) {
      const hours = randomHours(7, 10);
      const message = getRandomMessage("replyToBot").replace("{hours}",hours.toString());
      return await ctx.reply(message, replyBuilder.withCurrentMessageId());
    }
    if (targetUser) {
      const hours = randomHours(3, 10);
      const username = targetUser.username
        ? `@${targetUser.username}`
        : targetUser.first_name;
      const message = getRandomMessage("replyToUser")
        .replace("{username}", username)
        .replace("{hours}", hours.toString());
      await ctx.reply(message, replyBuilder.withRepliedMessageId());
    }
    const hours = randomHours(1, 7);
    const message = getRandomMessage("notReplyingToAnyone").replace("{hours}", hours.toString());
    await ctx.reply(message);
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
