import { Context } from 'grammy';

export class AdminService {
  static async grant(ctx: Context): Promise<string> {
    const replyUser = ctx.message?.reply_to_message?.from!;
    if (!replyUser) {
      return 'Please reply to the user you want to promote to admin.';
    }
    if (replyUser.id === ctx.me?.id) {
      return '⚠️ I cannot promote myself.';
    }
    const input = ctx.message?.text!.split(/\s+/).slice(1);
    const nickname = input!.join('').toLowerCase() || 'admin';
    await this.applyPromote(ctx, replyUser.id, true);
    if (nickname) {
      await this.setNickname(ctx, replyUser.id, nickname);
      return `${replyUser.first_name} has been promoted to admin with the title "${nickname}".`;
    }

    return `${replyUser.first_name} has been promoted to admin.`;
  }
  static async revoke(ctx: Context) {
    const replyUser = ctx.message?.reply_to_message?.from!;
    if (!replyUser) {
      return 'Please reply to the user you want to promote to admin.';
    }
    if (replyUser.id === ctx.me?.id) {
      return '⚠️ I cannot demote myself.';
    }

    await this.applyPromote(ctx, replyUser.id, false);
    return `${replyUser.first_name} has been demoted from admin.`;
  }
  private static async applyPromote(ctx: Context, userId: number, allow: boolean) {
    await ctx.api.promoteChatMember(ctx.chat!.id, userId, {
      can_delete_messages: allow,
      can_invite_users: allow,
      can_pin_messages: allow,
    });
  }
  private static async setNickname(ctx: Context, userId: number, nickname: string) {
    await ctx.api.setChatAdministratorCustomTitle(ctx.chat!.id, userId, nickname);
  }
}
