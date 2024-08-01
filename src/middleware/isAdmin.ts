import { SafeExecution } from "../decorators/SafeExecution";
import { logger } from "../helper/logging";
import { Middleware } from "./mid";
export class IsAdmin extends Middleware {
  @SafeExecution()
  async execute(): Promise<void> {
    const userId = (await this.bot.getUser()).id;
    if (!userId) {
      logger.error("User ID is not available.", undefined, "CheckAdmin", {
        context: this.ctx.message,
      });
      await this.ctx.reply(
        "Oops! We couldn't determine your identity. Please try again."
      );
      return;
    }

    const isAdmin = await this.bot.isUserAdmin(userId);
    if (isAdmin) {
      return this.nxt();
    } else {
      await this.ctx.reply(
        "Sorry, but you need to be an admin to use this command!",
        {
          reply_to_message_id: this.ctx.message?.message_id,
        }
      );
    }
  }
}
