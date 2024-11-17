import { Context, InlineKeyboard } from 'grammy';
import { BotReply } from '../../../utils/chat/BotReply';
import { Catch } from '../../../decorators/Catch';
import { AdminValidationService } from '../../service/admin/validation';
import { ApprovedService } from '../../service/admin/Approved';
import { BanService } from '../../service/admin/Ban';
import { WarnService } from '../../service/admin/Warn';
import { parseDuration, tehranZone } from '../../../utils';
import { MuteService } from '../../service/admin/Mute';
import { AdminService } from '../../service/admin/Admin';
import { BlackListService } from '../../service/admin/Blacklist';
import { ChatInfo } from '../../../utils/chat/ChatInfo';
import { GroupSettingsService } from '../../service/admin/Welcome';
export class AdminCommands {
  /** Approved Commands */
  @Catch({
    category: 'Admin Command',
    message: 'An unexpected error occurred while processing the "approved" command. Please try again later.',
    statusCode: 500,
  })
  static async approved(ctx: Context) {
    const reply = new BotReply(ctx);
    const validationResult = await AdminValidationService.validateContext(ctx);

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
    const validationResult = await AdminValidationService.validateContext(ctx);

    if (!validationResult) {
      return;
    }

    const { groupId, userId } = validationResult;
    await ApprovedService.updateDisapproved(ctx, groupId, userId);
    await reply.textReply(`User with ID ${userId} has been successfully disapproved for group ${groupId}.`);
  }
  @Catch({
    category: 'Admin Command',
    message: 'An unexpected error occurred while processing the "approvedlist" command. Please try again later.',
    statusCode: 500,
  })
  static async approvedlist(ctx: Context) {
    const reply = new BotReply(ctx);
    const groupId = ctx.chat!.id;
    const approvedUsers = await ApprovedService.getApprovedUsers(ctx, groupId);
    if (!approvedUsers.length) {
      await reply.textReply('There are currently no approved users in this group.');
      return;
    }
    const approvedListMessage = approvedUsers.map((user) => `• **ID:** ${user.telegram_id}\n  **Name:** ${user.first_name}`).join('\n\n');

    // Send a formatted message with the list of approved users
    await reply.markdownReply(`Here is the list of approved users in this group:\n\n${approvedListMessage}`);
  }
  /** Ban Commands */
  static async ban(ctx: Context) {
    const reply = new BotReply(ctx);
    const groupId = ctx.chat!.id;
    const isBanUser = await BanService.ban(ctx);
    if (isBanUser) {
      await ctx.api.banChatMember(groupId, ctx.message?.reply_to_message?.from?.id!);
      await reply.textReply(`User ${ctx.message?.reply_to_message?.from!.first_name} has been removed from the group and their information has been deleted.`);
      return;
    } else {
      await reply.textReply('User or group not found.');
      return;
    }
  }
  static async unban(ctx: Context) {
    const reply = new BotReply(ctx);
    const unBanUser = await BanService.unBan(ctx);
    if (unBanUser) {
      await reply.textReply(`User ${ctx.message?.reply_to_message?.from?.first_name} has been unbanned and their information has been restored.`);
      return;
    } else {
      await reply.textReply('Please reply to a message from the user you want to unban.');
      return;
    }
  }
  /** Warn Commands */
  static async warn(ctx: Context) {
    const reply = new BotReply(ctx);
    const user = ctx.message?.reply_to_message?.from!;
    const { isWarningLimitReached, warningApplied, warnings } = await WarnService.warnUser(ctx);
    if (isWarningLimitReached && warningApplied) {
      await reply.textReply(`User ${user.first_name} has been muted for 1 day due to excessive warnings.`);
      return;
    } else if (!isWarningLimitReached && warningApplied) {
      await reply.textReply(`User ${user.first_name} has been warned. They now have ${warnings} warnings.`);
      return;
    } else {
      await reply.textReply('User or group not found.');
      return;
    }
  }
  static async rmwarn(ctx: Context) {
    const reply = new BotReply(ctx);
    const user = ctx.message?.reply_to_message?.from!;
    const { warningRemoved, warnings } = await WarnService.removeWarn(ctx);

    if (warningRemoved) {
      await reply.textReply(`User ${user.first_name} now has ${warnings} warnings after the removal.`);
    } else {
      await reply.textReply('User or group not found or no warnings to remove.');
    }
  }
  static async warns(ctx: Context) {
    const reply = new BotReply(ctx);
    const user = ctx.message?.reply_to_message?.from!;

    const { warnings } = await WarnService.getUserWarnById(ctx);

    if (warnings >= 0) {
      await reply.textReply(`User ${user.first_name} currently has ${warnings} warnings.`);
    } else {
      await reply.textReply('User not found.');
    }
  }
  static async warnslist(ctx: Context) {
    const reply = new BotReply(ctx);
    const warns = await WarnService.getAllWarns(ctx);
    await reply.markdownReply(`${warns}`);
  }
  /** Mute Commands */
  static async mute(ctx: Context) {
    const reply = new BotReply(ctx);
    const message = await MuteService.muteUser(ctx);
    return await reply.textReply(message);
  }
  static async unmute(ctx: Context) {
    const reply = new BotReply(ctx);
    const message = await MuteService.unmuteUser(ctx);
    return await reply.textReply(message);
  }
  /** Admin Command  */
  static async grant(ctx: Context) {
    const reply = new BotReply(ctx);
    const grantUser = await AdminService.grant(ctx);
    await reply.textReply(grantUser);
  }
  static async revoke(ctx: Context) {
    const reply = new BotReply(ctx);
    const revokeUser = await AdminService.revoke(ctx);
    await reply.textReply(revokeUser);
  }
  @Catch({
    category: 'BlackList',
    message: 'Failed to retrieve or send the blacklist.',
    statusCode: 500,
  })
  /** BlackList Command */
  static async blacklist(ctx: Context) {
    const reply = new BotReply(ctx);
    const userId = ctx.from?.id!;
    const groupId = ctx.chat?.id!;
    const admins = await ctx.getChatAdministrators();
    const isAdmin = admins.some((admin) => admin.user.id === userId);
    if (!isAdmin) {
      await reply.textReply('You need to be an admin to view the blacklist.');
      return;
    }
    await reply.textReply('I have sent you a message in your private chat with the blacklist.');
    const blackList = await BlackListService.getAll(ctx, groupId);
    if (blackList.length === 0) {
      await ctx.api.sendMessage(userId, 'The blacklist is currently empty.');
    } else {
      await ctx.api.sendMessage(userId, `Blacklist:\n${blackList.join('\n')}`);
    }
    return;
  }
  @Catch({
    category: 'BlackList',
    message: 'Failed to add word to the blacklist.',
    statusCode: 400,
  })
  /** Add a Word to the Blacklist */
  static async abl(ctx: Context) {
    const reply = new BotReply(ctx);
    await ctx.deleteMessage();
    const groupId = ctx.chat?.id!;
    const word = ctx.message?.text?.split(' ')[1];
    if (!word) {
      await reply.textReply('Please specify a word to add to the blacklist.');
      return;
    }
    await BlackListService.add(groupId, word);
    await reply.send('Blacklist has been updated.');
  }
  @Catch({
    category: 'BlackList',
    message: 'Failed to remove word from the blacklist.',
    statusCode: 400,
  })
  /** Remove the Last Word from the Blacklist */
  static async rmbl(ctx: Context) {
    const reply = new BotReply(ctx);
    await ctx.deleteMessage();
    const groupId = ctx.chat?.id!;
    const wordToRemove = ctx.message?.text?.split(' ')[1];
    await BlackListService.remove(groupId, wordToRemove);
    await reply.send('Blacklist has been updated.');
  }
  @Catch({
    category: 'BlackList',
    message: 'Failed to Clear the Entire Blacklist.',
    statusCode: 400,
  })
  /** Clear the Entire Blacklist */
  static async clrbl(ctx: Context) {
    await ctx.deleteMessage();
    const reply = new BotReply(ctx);
    const groupId = ctx.chat?.id!;
    await BlackListService.clear(groupId);
    await reply.send('The blacklist has been cleared.');
  }
  /** Pin Command */
  static async pin(ctx: Context) {
    const reply = new BotReply(ctx);
    const groupId = ctx.chat?.id!;
    const messageId = ctx.message?.reply_to_message?.message_id!;
    await ctx.api.pinChatMessage(groupId, messageId);
    await reply.textReply('The message has been pinned.');
  }
  static async unpin(ctx: Context) {
    const reply = new BotReply(ctx);
    const groupId = ctx.chat?.id!;
    const messageId = ctx.message?.reply_to_message?.message_id!;
    await ctx.api.unpinChatMessage(groupId, messageId);
    await reply.textReply('The pinned message has been unpinned.');
  }
  /** Purge Command */
  static async purge(ctx: Context) {
    const reply = new BotReply(ctx);
    const chatId = ctx.chat?.id;
    const replyToMessageId = ctx.message?.reply_to_message?.message_id;
    if (!chatId || !replyToMessageId) {
      return reply.send('Please reply to a message and use the /purge command.');
    }

    let lastMessageId = ctx.message?.message_id;
    if (!lastMessageId) {
      return reply.send('No message ID found.');
    }

    const countMessages = lastMessageId - replyToMessageId;
    if (countMessages <= 0) {
      return reply.send('The reply-to message is not older than the current message or no messages to delete.');
    }

    const messagesToDelete = [];
    for (let i = 0; i <= countMessages; i++) {
      messagesToDelete.push(replyToMessageId + i);
    }

    const deleteMessagesInBatches = async (messages: number[]) => {
      const batchSize = 100;
      for (let i = 0; i < messages.length; i += batchSize) {
        const batch = messages.slice(i, i + batchSize);
        await ctx.deleteMessages(batch);
      }
    };

    await deleteMessagesInBatches(messagesToDelete);
    await reply.send('Deleting done.');
  }
  /** Group Setting Command */
  static async welcome(ctx: Context) {
    const reply = new BotReply(ctx);
    const input = ctx.message?.text!.split(/\s+/).slice(1);
    const action = input![0]?.toLowerCase();
    const welcomeContent = input!.join(' ');
    if (!action) {
      // Retrieve the current welcome message from the database (or service)
      const currentWelcome = await GroupSettingsService.getWelcomeMessage(ctx, welcomeContent);
      if (currentWelcome) {
        await reply.textReply(`Current welcome message: \n${currentWelcome}`);
      } else {
        await reply.textReply('No welcome message set for this group.');
      }
      return;
    }

    // Case to remove the welcome message
    if (action === 'r') {
      // Delete the current welcome message from the database (or service)
      const result = await GroupSettingsService.removeWelcomeMessage(ctx);
      if (result) {
        await reply.textReply('The welcome message has been removed.');
      } else {
        await reply.textReply('No welcome message to remove.');
      }
      return;
    }
    if (welcomeContent) {
      await GroupSettingsService.setWelcomeMessage(ctx, welcomeContent);
      await reply.textReply(`The welcome message has been updated to: \n${welcomeContent}`);
      return;
    }

    // Default response if no valid action is detected
    await reply.textReply('Invalid usage of the /welcome command. Use "/welcome" to view the current message, "/welcome r" to remove it, or "/welcome [message]" to set a new welcome message.');
  }
}
