import { Context } from "grammy";
import { MESSAGE } from "../helper/message";
import { SafeExecution } from "../decorators/SafeExecution";
import { AdminCommand } from "../group-management/AdminCommand";
export class Command {
   private static commandMap: { [key: string]: (ctx: Context) => Promise<any> } =  {
    "start":Command.start,
    "help":Command.help,
    "warn": AdminCommand.Warn,
    "rmWarn": AdminCommand.WarnClear,
    "mute": AdminCommand.mute,
    "unMute": AdminCommand.MuteClear,
    "ban": AdminCommand.ban,
    "unBan": AdminCommand.unBan,
    "purge": AdminCommand.Purge,
    "approved": AdminCommand.approved,
    "unApproved": AdminCommand.unApproved,
    "lock": AdminCommand.lock,
    "unLock": AdminCommand.unLock,
    "blacklist": AdminCommand.getBlackList,
    "abl":AdminCommand.addBlackList,
    "rmbl":AdminCommand.RemoveMessageBlackList,
    "date": AdminCommand.date
  };

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
  static async handleCommand(ctx: Context): Promise<void> {
    /**
     * Extracts the command from a message that may include additional text after the command.
     *
     * For example, if the message is "/warn example", this code will:
     * 1. Split the message by the '/' character.
     * 2. Take the second part of the split result (which is "warn example").
     * 3. Further split this part by spaces and take the first element (which is "warn").
     *
     * This ensures that only the command itself is extracted, excluding any subsequent arguments.
     */
const command = ctx.message?.text?.split("/")[1]?.split(/[\s@]/)[0];
  console.log(command);

    if (command) {
      const commandFunction = Command.commandMap[command];
      if (commandFunction) {
        await commandFunction(ctx);
      } else {
        await ctx.reply("Unknown command.", {
          reply_to_message_id: ctx.message?.message_id,
        });
      }
    } else {
      await ctx.reply("Command is missing.", {
        reply_to_message_id: ctx.message?.message_id,
      });
    }
  }
}
