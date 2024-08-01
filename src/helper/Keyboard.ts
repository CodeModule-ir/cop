import { Context, InlineKeyboard } from "grammy";
import { SafeExecution } from "../decorators/SafeExecution";

export class ButtonKeyboard {
  private ctx: Context;
  constructor(ctx: Context) {
    this.ctx = ctx;
  }
  @SafeExecution()
  async singleBtn(text: string, callbackData: string): Promise<InlineKeyboard> {
    return await new InlineKeyboard().text(text, callbackData);
  }
  get userId() {
    return parseInt(this.ctx.match![1]);
  }
  async getWarnUsername() {
    const { user } = await this.ctx.getChatMember(this.userId);
    return user.username || user.first_name || "Unknown user";
  }
}
