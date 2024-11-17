import { Context } from 'grammy';
import { parseDuration } from '../../../utils';
import { tehranZone } from '../general/date';

export class MuteService {
  /**
   * Mutes a user in the chat for a specified duration or indefinitely.
   * @param ctx - The bot context.
   * @returns A message indicating the duration of the mute.
   */
  static async muteUser(ctx: Context): Promise<string> {
    const replyMessage = ctx.message?.reply_to_message;
    if (!replyMessage) {
      return 'Please reply to a user to mute them.';
    }

    const userId = replyMessage.from?.id!;
    const durationStr = MuteService.extractDurationFromCommand(ctx.message?.text);
    const durationMs = durationStr ? parseDuration(durationStr) : null;

    const expiration = durationMs ? new Date(tehranZone().getTime() + durationMs) : null;
    await MuteService.applyRestrictions(ctx, userId, false, expiration!);

    return durationMs ? `User ${replyMessage.from?.first_name} has been muted for ${durationStr}.` : `User ${replyMessage.from?.first_name} has been muted indefinitely.`;
  }
  /**
   * Unmutes a user in the chat by restoring their permissions.
   * @param ctx - The bot context.
   * @returns A success message.
   */
  static async unmuteUser(ctx: Context): Promise<string> {
    const replyMessage = ctx.message?.reply_to_message!;
    const userId = replyMessage.from?.id!;
    await MuteService.applyRestrictions(ctx, userId, true);

    return `User ${replyMessage.from?.first_name} has been unmuted and their permissions have been restored.`;
  }
  /**
   * Extracts the duration from the bot command.
   * @param commandText - The text of the command.
   * @returns The duration string or null if not provided.
   */
  private static extractDurationFromCommand(commandText?: string): string | null {
    if (!commandText) return null;
    const input = commandText.split(/\s+/).slice(1);
    return input.join('').toLowerCase() || null;
  }
  /**
   * Applies chat restrictions to a user.
   * @param ctx - The bot context.
   * @param userId - The ID of the user to restrict/unrestrict.
   * @param allow - Whether to allow or restrict permissions.
   * @param expiration - The expiration time of the restrictions (optional).
   */
  private static async applyRestrictions(ctx: Context, userId: number, allow: boolean, expiration?: Date): Promise<void> {
    const untilDate = expiration ? Math.floor(expiration.getTime() / 1000) : undefined;

    await ctx.restrictChatMember(
      userId,
      {
        can_send_messages: allow,
        can_send_polls: allow,
        can_send_other_messages: allow,
        can_add_web_page_previews: allow,
        can_send_photos: allow,
        can_send_audios: allow,
      },
      { until_date: untilDate }
    );
  }
}
