import { Context } from 'grammy';
import { BotReply } from '../../../utils/chat/BotReply';
import { ChatInfo } from '../../../utils/chat/ChatInfo';

export class ReportCommand {
  // Store pending reports with user IDs as keys
  private static pendingReports = new Map<number, number>();

  /**
   * Sends a report to the group admins without publicly tagging them.
   * If the report is canceled before notification, the message will be deleted.
   *
   * @param ctx - The context object containing information about the incoming update.
   */
  static async report(ctx: Context) {
    const reply = new BotReply(ctx);
    const chatInfo = new ChatInfo(ctx);
    const isAdmin = await chatInfo.isAdmin(ctx.message?.reply_to_message?.from!.id!);
    if (isAdmin) {
      await reply.textReply('This user is an admin and cannot be processed for this action.');
      return;
    }
    // Ensure the report command is a reply to another message
    const reportedMessage = ctx.message?.reply_to_message;
    if (!reportedMessage || !reportedMessage.from) {
      await reply.textReply('Please use the /report command by replying to the message you want to report.');
      return;
    }

    // Get reported user details
    const reportedUser = reportedMessage.from;
    const reportedUserName = reportedUser.first_name;
    const reportedUserId = reportedUser.id;
    const chatId = Math.abs(ctx.chat!.id + 1000000000000);
    const messageLink = `https://t.me/c/${chatId}/${reportedMessage.message_id}`;
    // Collect secret mentions of all admins
    const admins = await ctx.api.getChatAdministrators(ctx.chat!.id);
    const adminMentions = admins
      .filter((admin) => !admin.user.is_bot)
      .map((admin) => `<a href="tg://user?id=${admin.user.id}"> </a>`)
      .join('');

    // Format the report message for admins
    const reportMessage = `
<b>🚨 Report Notification</b>
- Reported User: ${reportedUserName} (ID: ${reportedUserId})
- Reported by: @${ctx.from?.username || ctx.from?.first_name} (ID: ${ctx.from?.id})
- Message Link: <a href="${messageLink}">Click here to view the message</a>
    `.trim();
    const finalMessage = `${reportMessage}`;
    // Notify the reporter
    await reply.replyToMessage(`${reportedUserName}${adminMentions}(${reportedUserId}) was reported to administrators.`);

    // Send the report to admins only after a delay, allowing time for cancellation
    const delayForCancel = 300000; // 5 minutes (300,000 milliseconds)  delay for cancellation
    const reportTimeout = setTimeout(async () => {
      for (const admin of admins) {
        if (admin.user.is_bot) continue;
        await ctx.api.sendMessage(admin.user.id, finalMessage, { parse_mode: 'HTML' });
      }
      // Remove the report from pendingReports after sending
      ReportCommand.pendingReports.delete(ctx.from!.id);
    }, delayForCancel);

    // Store the report with user ID and the setTimeout ID for canceling
    ReportCommand.pendingReports.set(ctx.from!.id, Number(reportTimeout));
  }

  /**
   * Cancels the pending report.
   * If the report is canceled, it will not be sent to the admins.
   *
   * @param ctx - The context object containing information about the incoming update.
   */
  static async cancel(ctx: Context) {
    const reply = new BotReply(ctx);
    const reportTimeout = ReportCommand.pendingReports.get(ctx.from!.id);
    if (reportTimeout) {
      clearTimeout(reportTimeout);
      ReportCommand.pendingReports.delete(ctx.from!.id);
      await reply.textReply('Your report has been canceled and will not be sent to the admins.');
    } else {
      await reply.textReply('There is no report to cancel.');
    }
  }
}
