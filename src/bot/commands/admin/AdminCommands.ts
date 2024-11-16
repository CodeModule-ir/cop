import { Context } from 'grammy';
import { BotReply } from '../../../utils/chat/BotReply';
import { Catch } from '../../../decorators/Catch';
import { AdminValidationService } from '../../service/admin/validation';
import { ApprovedService } from '../../service/admin/Approved';

export class AdminCommands {
  /** Approved Commands */
  @Catch({
    category: 'Admin Command',
    message: 'An unexpected error occurred while processing the "approved" command. Please try again later.',
    statusCode: 500,
  })
  static async approved(ctx: Context) {
    const reply = new BotReply(ctx);
    const validationResult = await AdminValidationService.validateApprovalContext(ctx);

    if (!validationResult) {
      return;
    }
    const { groupId, userId } = validationResult;
    await ApprovedService.updateApproved(ctx, groupId, userId);
    await reply.textReply(`User with ID ${userId} has been successfully approved for group ${groupId}.`);
  }
  @Catch({
    category: 'Admin Command',
    message: 'An unexpected error occurred while processing the "disapproved" command. Please try again later.',
    statusCode: 500,
  })
  static async disapproved(ctx: Context) {
    const reply = new BotReply(ctx);
    // Validate the context to extract required group and user IDs
    const validationResult = await AdminValidationService.validateApprovalContext(ctx);

    if (!validationResult) {
      return;
    }

    const { groupId, userId } = validationResult;
    await ApprovedService.updateDisapproved(ctx,groupId, userId);
    await reply.textReply(`User with ID ${userId} has been successfully disapproved for group ${groupId}.`);
  }
  @Catch({
    category: 'Admin Command',
    message: 'An unexpected error occurred while processing the "approvedlist" command. Please try again later.',
    statusCode: 500,
  })
  static async approvedlist(ctx: Context) {
    const reply = new BotReply(ctx);
    const chat = ctx.chat;
    if (!(chat?.type === 'group' || chat?.type === 'supergroup')) {
      await ctx.reply('This command can only be used in groups.');
      return;
    }

    const groupId = chat.id;
    const approvedUsers = await ApprovedService.getApprovedUsers(ctx, groupId);
    if (!approvedUsers.length) {
      await reply.textReply('No users are approved in this group.');
      return;
    }
    const approvedListMessage = approvedUsers.map((user) => `ID: ${user.telegram_id},\nFirstname: ${user.first_name}`).join('\n');
    await reply.textReply(`Approved users in this group:\n${approvedListMessage}`);
  }
  /** Ban Commands */
  static async ban() {}
  static async unban() {}
  /** Warn Commands */
  static async warn() {}
  static async rmwarn() {}
  static async warns() {}
  static async warnslist() {}
  /** Mute Commands */
  static async mute() {}
  static async unmute() {}
  static async mutelist() {}
  /** Admin Command  */
  static async grant() {}
  static async revoke() {}
  /** BlackList Command */
  static async blacklist() {}
  static async rmbl() {}
  static async abl() {}
  /** Rules Commands */
  /** add-rule|edit-rule|delete-rule|delete_last-rule|view-rule| */
  static async rules() {}
  /** Pin Command */
  static async pin() {}
  static async unpin() {}
  /** Purge Command */
  static async purge() {}
  /** Group Setting Command */
  static async lock() {}
  static async unlock() {}
  static async title() {}
  static async welcome() {}

  /** General Commands */
  static async group_stats() {}
}
