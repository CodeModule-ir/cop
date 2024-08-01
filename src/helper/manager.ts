import { Context } from "grammy";
import { ButtonKeyboard } from "./Keyboard";
import { BotOverseer } from "./BotOverseer";
export class BotService {
  private ctx: Context;
  constructor(ctx: Context) {
    this.ctx = ctx;
  }
  get InlineKeyboard(): ButtonKeyboard {
    return new ButtonKeyboard(this.ctx)
  }
  get BotManager(): BotOverseer {
    return new BotOverseer(this.ctx);
  }
}
