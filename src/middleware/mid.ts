import { Context, NextFunction } from "grammy";
import { BotOverseer } from "../helper/BotOverseer";
export abstract class Middleware {
  protected ctx: Context;
  protected bot: BotOverseer;
  protected nxt: NextFunction;

  constructor(ctx: Context, nxt: NextFunction) {
    this.ctx = ctx;
    this.bot = new BotOverseer(ctx);
    this.nxt = nxt;
  }
}
