import { Context } from 'grammy';
import { BotReply } from '../../../utils/chat/BotReply';
import { Catch } from '../../../decorators/Catch';
import { AdminValidationService } from '../../service/admin/validation';
import { ApprovedService } from '../../service/admin/Approved';
import { BanService } from '../../service/admin/Ban';
import { WarnService } from '../../service/admin/Warn';
import { MuteService } from '../../service/admin/Mute';
import { AdminService } from '../../service/admin/Admin';
import { BlackListService } from '../../service/admin/Blacklist';
import { ChatInfo } from '../../../utils/chat/ChatInfo';
import { GroupSettingsService } from '../../service/admin/Welcome';
import { OnlyAdminsCanUse } from '../../../decorators/User';
import { RequireReply, RestrictToGroupChats } from '../../../decorators/Context';
import { EnsureUserAndGroup } from '../../../decorators/Database';
import { BotIsAdmin } from '../../../decorators/Bot';
export class AdminCommands {
  /** Approved Commands */
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @RequireReply()
  @EnsureUserAndGroup()
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
    const isApproved = await ApprovedService.updateApproved(groupId, userId);
    if (!isApproved) {
      await reply.textReply(`This user has already been approved.`);
    } else {
      await reply.textReply(
        `The user with ID ${userId} has been successfully approved to join the group ${groupId}. You can view the list of approved users using /approvedlist, and manage disapproved users with /disapproved.`
      );
    }
  }

  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @RequireReply()
  @EnsureUserAndGroup()
  @Catch({
    category: 'Admin Command',
    message: 'An unexpected error occurred while processing the "disapproved" command. Please try again later.',
    statusCode: 500,
  })
  static async disapproved(ctx: Context) {
    const reply = new BotReply(ctx);
    // Validate the context to extract required group and user IDs
    const validationResult = (await AdminValidationService.validateContext(ctx))!;
    const { groupId, userId } = validationResult;
    const disapprovedUser = await ApprovedService.updateDisapproved(groupId, userId);
    if (!disapprovedUser) {
      await reply.textReply('This user is not currently approved, so they cannot be disapproved.');
    } else {
      await reply.textReply(`User with ID ${userId} has been successfully disapproved and removed from group ${groupId}.`);
    }
  }

  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @EnsureUserAndGroup()
  @Catch({
    category: 'Admin Command',
    message: 'An unexpected error occurred while processing the "approvedlist" command. Please try again later.',
    statusCode: 500,
  })
  static async approvedlist(ctx: Context) {
    const reply = new BotReply(ctx);
    const groupId = ctx.chat!.id;
    const approvedUsers = await ApprovedService.getApprovedUsers(groupId);
    if (!approvedUsers.length) {
      await reply.textReply('There are currently no approved users in this group.');
      return;
    }
    const approvedListMessage = approvedUsers.map((user) => `• **ID:** ${user.telegram_id}\n  **Name:** ${user.first_name}`).join('\n\n');

    // Send a formatted message with the list of approved users
    await reply.markdownReply(`Here is the list of approved users in this group:\n\n${approvedListMessage}`);
  }
  /** Ban Commands */
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @RequireReply()
  @EnsureUserAndGroup()
  @Catch()
  static async ban(ctx: Context) {
    const reply = new BotReply(ctx);
    const groupId = ctx.chat!.id;
    const isBanUser = await BanService.ban(ctx);
    if (isBanUser) {
      await ctx.api.banChatMember(groupId, ctx.message?.reply_to_message?.from?.id!);
      await reply.textReply(`User ${ctx.message?.reply_to_message?.from!.first_name} has been removed from the group and their information has been deleted.`);
      return;
    }
  }
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @RequireReply()
  @EnsureUserAndGroup()
  @Catch()
  static async unban(ctx: Context) {
    const reply = new BotReply(ctx);
    const unBanUser = await BanService.unBan(ctx);
    if (unBanUser) {
      await reply.textReply(`User ${ctx.message?.reply_to_message?.from?.first_name} has been unbanned.`);
      return;
    }
  }
  /** Warn Commands */
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @RequireReply()
  @EnsureUserAndGroup()
  @Catch()
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
    }
  }
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @RequireReply()
  @EnsureUserAndGroup()
  @Catch()
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
  @RestrictToGroupChats()
  @BotIsAdmin()
  @EnsureUserAndGroup()
  static async warns(ctx: Context) {
    const reply = new BotReply(ctx);
    const replyMessage = ctx.message?.reply_to_message;
    let user = ctx.message?.reply_to_message?.from!;
    if (!replyMessage) {
      user = ctx.from!;
    }
    const { warnings } = await WarnService.getUserWarnById(ctx, user.id);
    if (warnings >= 0) {
      return await reply.textReply(`User ${user.first_name} currently has ${warnings} warnings.`);
    } else {
      return await reply.textReply('User not found.');
    }
  }
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @EnsureUserAndGroup()
  @Catch()
  static async warnslist(ctx: Context) {
    const reply = new BotReply(ctx);
    const warns = await WarnService.getAllWarns(ctx);
    await reply.markdownReply(`${warns}`);
  }
  /** Mute Commands */
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @RequireReply()
  @EnsureUserAndGroup()
  @Catch()
  static async mute(ctx: Context) {
    const reply = new BotReply(ctx);
    const message = await MuteService.muteUser(ctx);
    return await reply.textReply(message);
  }
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @RequireReply()
  @EnsureUserAndGroup()
  @Catch()
  static async unmute(ctx: Context) {
    const reply = new BotReply(ctx);
    const message = await MuteService.unmuteUser(ctx);
    return await reply.textReply(message);
  }
  /** Admin Command  */
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @RequireReply()
  @EnsureUserAndGroup()
  @Catch()
  static async grant(ctx: Context) {
    const reply = new BotReply(ctx);
    const chatInfo = new ChatInfo(ctx);
    const isOwner = await chatInfo.userIsOwner();
    if (isOwner) {
      await reply.textReply('The owner of the chat cannot be granted administrator privileges.');
      return;
    }
    const grantUser = await AdminService.grant(ctx);
    await reply.textReply(grantUser);
  }
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @RequireReply()
  @EnsureUserAndGroup()
  @Catch()
  static async revoke(ctx: Context) {
    const reply = new BotReply(ctx);
    const chatInfo = new ChatInfo(ctx);
    const isOwner = await chatInfo.userIsOwner();
    if (isOwner) {
      await reply.textReply("You cannot revoke the owner's rights.");
      return;
    }
    const revokeUser = await AdminService.revoke(ctx);
    await reply.textReply(revokeUser);
  }

  /** BlackList Command */
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @EnsureUserAndGroup()
  @Catch({
    category: 'BlackList',
    message: 'Failed to retrieve or send the blacklist.',
    statusCode: 500,
  })
  static async blacklist(ctx: Context) {
    const reply = new BotReply(ctx);
    // Fetch the group info
    const group = ctx.chat;
    const userId = ctx.from?.id!;
    const groupId = group?.id!;
    const admins = await ctx.getChatAdministrators();
    const isAdmin = admins.some((admin) => admin.user.id === userId);
    if (!isAdmin) {
      await reply.textReply('You need to be an admin to view the blacklist.');
      return;
    }
    await reply.textReply('I have sent you a message in your private chat with the blacklist.');
    const blackList = await BlackListService.getAll(ctx, groupId);
    // Gather information about the group
    const groupInfo = `
    Group Title: ${group?.title || 'N/A'}\n
Group ID: ${groupId}\n
Group Type: ${group?.type || 'Unknown'}
  `;

    // Send the group info along with the blacklist
    if (blackList.length === 0) {
      await ctx.api.sendMessage(userId, `${groupInfo}\nThe blacklist is currently empty.`);
    } else {
      await ctx.api.sendMessage(userId, `${groupInfo}\nBlacklist:\n${blackList.join('\n')}`);
    }
    return;
  }

  /** Add a Word to the Blacklist */
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @EnsureUserAndGroup()
  @Catch({
    category: 'BlackList',
    message: 'Failed to add word to the blacklist.',
    statusCode: 400,
  })
  static async abl(ctx: Context) {
    const reply = new BotReply(ctx);
    await ctx.deleteMessage();
    const groupId = ctx.chat?.id!;
    const word = ctx.message?.text?.split(' ')[1];
    if (!word) {
      await reply.textReply('Please specify a word to add to the blacklist.');
      return;
    }
    await BlackListService.add(groupId, word, ctx);
    await reply.sendToTopic('Blacklist has been updated.', ctx.message?.reply_to_message?.message_thread_id!);
  }

  /** Remove the Last Word from the Blacklist */
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @EnsureUserAndGroup()
  @Catch({
    category: 'BlackList',
    message: 'Failed to remove word from the blacklist.',
    statusCode: 400,
  })
  static async rmbl(ctx: Context) {
    const reply = new BotReply(ctx);
    await ctx.deleteMessage();
    const groupId = ctx.chat?.id!;
    const wordToRemove = ctx.message?.text?.split(' ')[1];
    await BlackListService.remove(groupId, ctx, wordToRemove);
    await reply.sendToTopic('Blacklist has been updated.', ctx.message?.reply_to_message?.message_thread_id!);
  }

  /** Clear the Entire Blacklist */
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @EnsureUserAndGroup()
  @Catch({
    category: 'BlackList',
    message: 'Failed to Clear the Entire Blacklist.',
    statusCode: 400,
  })
  static async clrbl(ctx: Context) {
    await ctx.deleteMessage();
    const reply = new BotReply(ctx);
    const groupId = ctx.chat?.id!;
    await BlackListService.clear(groupId, ctx);
    await reply.sendToTopic('The blacklist has been cleared.', ctx.message?.reply_to_message?.message_thread_id!);
  }
  /** Pin Command */
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @RequireReply()
  @EnsureUserAndGroup()
  @Catch()
  static async pin(ctx: Context) {
    const reply = new BotReply(ctx);
    const groupId = ctx.chat?.id!;
    const messageId = ctx.message?.reply_to_message?.message_id!;
    await ctx.api.pinChatMessage(groupId, messageId);
    await reply.textReply('The message has been pinned.');
  }
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @RequireReply()
  @EnsureUserAndGroup()
  @Catch()
  static async unpin(ctx: Context) {
    const reply = new BotReply(ctx);
    const groupId = ctx.chat?.id!;
    const messageId = ctx.message?.reply_to_message?.message_id!;
    await ctx.api.unpinChatMessage(groupId, messageId);
    await reply.textReply('The pinned message has been unpinned.');
  }
  /** Purge Command */
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @RequireReply()
  @EnsureUserAndGroup()
  static async purge(ctx: Context) {
    const reply = new BotReply(ctx);
    const chatInfo = new ChatInfo(ctx);
    const topicChat = chatInfo.chatIsTopic();
    if (topicChat) {
      await reply.textReply('The /purge command cannot be used in a topic group.');
      return;
    }
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
  @RestrictToGroupChats()
  @BotIsAdmin()
  @OnlyAdminsCanUse()
  @EnsureUserAndGroup()
  static async welcome(ctx: Context) {
    const reply = new BotReply(ctx);
    const input = ctx.message?.text!.split(' ').slice(1);
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
