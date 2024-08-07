import { Context } from "grammy";
import { MESSAGE } from "../../helper/message";
import { initGroupSetting } from "../../decorators/db";

export class MuteService {
  private userId: number;
  private ctx: Context;

  constructor(ctx: Context, userId: number) {
    this.userId = userId;
    this.ctx = ctx;
  }

  /**
   * Mutes a user with an optional expiration time.
   */
  @initGroupSetting()
  async mute(expiration?: Date | null) {
    await this.isMute(false, expiration!);
    return MESSAGE.MUTE_SET(
      this.ctx.message?.reply_to_message?.from! || this.ctx.message?.from!,
      expiration!
    );
  }
  /**
   * Applies mute restrictions to the user.
   */
  private async isMute(status: boolean = true, expiration?: Date | undefined) {
    const untilDate = expiration
      ? Math.floor(expiration.getTime() / 1000)
      : undefined;

    await this.ctx.restrictChatMember(
      this.userId,
      {
        can_send_messages: status,
        can_send_photos: status,
        can_send_other_messages: status,
        can_add_web_page_previews: status,
        can_send_audios: status,
      },
      { until_date: untilDate }
    );
  }
  /**
   * Lifts the mute restrictions.
   */
  @initGroupSetting()
  async unmute() {
    await this.isMute(true);
    return MESSAGE.MUTE_CLEAR(this.ctx.message?.reply_to_message?.from!);
  }
}
