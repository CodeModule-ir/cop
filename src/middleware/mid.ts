import { Context, NextFunction } from "grammy";
import { BotOverseer } from "../service/bot";
import { ReplyBuilder } from "../helper";
export abstract class Middleware {
  protected ctx: Context;
  protected bot: BotOverseer;
  protected nxt: NextFunction;
  protected reply:ReplyBuilder
  constructor(ctx: Context, nxt: NextFunction) {
    this.ctx = ctx;
    this.bot = new BotOverseer(ctx);
    this.reply = new ReplyBuilder(ctx)
    this.nxt = nxt;
  }
}
