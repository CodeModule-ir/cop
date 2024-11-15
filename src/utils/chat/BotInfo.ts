import { Context } from 'grammy';

export class BotInfo {
  constructor(private _ctx: Context) {
    this._ctx = _ctx;
  }
  async isAdmin(): Promise<boolean> {
    const botInfo = this._ctx.me;
    if (!botInfo) {
      return false;
    }

    const chatMember = await this._ctx.getChatMember(botInfo.id);
    if (!chatMember) {
      return false;
    }
    return ['administrator', 'creator'].includes(chatMember.status);
  }
}
