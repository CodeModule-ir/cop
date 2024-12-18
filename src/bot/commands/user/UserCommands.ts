import { Context } from 'grammy';
import { BotReply } from '../../../utils/chat/BotReply';
import { RoastMessages } from '../../../types/CommandTypes';
import * as roastMessages from '../../../utils/jsons/roast.json';
import { ReportCommand } from '../../service/user/ReportCommand';
import { ServiceProvider } from '../../../service/database/ServiceProvider';
import { Catch } from '../../../decorators/Catch';
import { ChatInfo } from '../../../utils/chat/ChatInfo';
import { RequireReply, RestrictToGroupChats } from '../../../decorators/Context';
import { EnsureUserAndGroup } from '../../../decorators/Database';
import { escapeMarkdownV2 } from '../../../utils';
import { ReplyToBot } from '../../../decorators/Bot';
import logger from '../../../utils/logger';
export class UserCommands {
  /**
   * Sends the rules of the group.
   * This command retrieves and sends the rules of the current group to the user.
   * It helps ensure that group members are aware of the guidelines for interaction.
   */
  @ReplyToBot()
  @RestrictToGroupChats()
  @EnsureUserAndGroup('from')
  @Catch()
  static async rules(ctx: Context) {
    const reply = new BotReply(ctx);
    const chatinfo = new ChatInfo(ctx);
    const services = ServiceProvider.getInstance();
    const groupRulesService = await services.getRulesService();
    if (!groupRulesService) {
      logger.warn('Group service unavailable. Skipping command execution.');
      return;
    }
    const input = ctx.message?.text!.split(/\s+/).slice(1);
    const action = input![0]?.toLowerCase();
    const ruleContent = input!.join(' ');
    if (!action) {
      // Default behavior: Display all rules
      const rulesMessage = await groupRulesService.getRulesByGroupId(ctx.chat?.id!);
      if (!rulesMessage) {
        return;
      }
      if (rulesMessage.length === 0) {
        await reply.markdownReply('No rules have been set for this group.');
      } else {
        const sanitizedRules = rulesMessage[0].rule_text.join('\n');
        await reply.markdownReply(sanitizedRules);
      }
      return;
    }
    const userIsAdmin = await chatinfo.userIsAdmin();
    if (!userIsAdmin) {
      await reply.textReply('Sorry, only admins are allowed to use this command.');
      return;
    }
    if (action === 'lr') {
      // Delete the last rule
      const updatedRules = await groupRulesService.deleteLastGroupRule(ctx);
      if (!updatedRules) {
        await reply.markdownReply('No rules to delete.');
      } else {
        await reply.markdownReply('Last rule has been deleted.');
      }
    } else if (action === 'r') {
      // Clear all rules
      if (await groupRulesService.clearAllRulesForGroup(ctx)) {
        await reply.markdownReply('All rules have been deleted.');
      } else {
        await reply.markdownReply('Something went wrong. Please try again in a few minutes.');
      }
    } else {
      // Add a new rule
      if (!ruleContent) {
        await reply.markdownReply('Please provide a rule to add.');
        return;
      }
      // Escape the rule content before saving and replying
      const sanitizedRuleContent = escapeMarkdownV2(ruleContent);
      await groupRulesService.addGroupRule(ctx, sanitizedRuleContent);
      await reply.markdownReply(`Rule added: "${sanitizedRuleContent}"`);
    }
  }
  /**
   * Sends a humiliating message when the /codetime command is triggered by a group member
   * or when someone replies to the bot with this command.
   * This is typically used for fun purposes,
   */
  @RestrictToGroupChats()
  @Catch()
  static async codetime(ctx: Context) {
    const user = ctx.from;
    if (!user) return;
    const reply = new BotReply(ctx);
    const targetUser = ctx.message?.reply_to_message?.from && !ctx.message.reply_to_message.forum_topic_created ? ctx.message.reply_to_message.from : undefined;
    const topic = ctx.message?.reply_to_message?.forum_topic_created;

    const randomHours = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    // Function to get a random message from the appropriate category
    const getRandomMessage = (category: keyof RoastMessages) => {
      const messages = roastMessages[category];
      const randomIndex = Math.floor(Math.random() * messages.length);
      return messages[randomIndex];
    };

    if (targetUser?.id === ctx.me?.id) {
      const hours = randomHours(7, 10);
      const message = getRandomMessage('replyToBot').replace('{hours}', hours.toString());
      return await reply.textReply(message);
    }
    if (targetUser) {
      const hours = randomHours(3, 10);
      const username = targetUser.username ? `@${targetUser.username}` : targetUser.first_name;
      const message = getRandomMessage('replyToUser').replace('{username}', username).replace('{hours}', hours.toString());
      await reply.replyToMessage(message);
    } else if (topic) {
      const hours = randomHours(4, 9);
      const message = getRandomMessage('notReplyingToAnyone').replace('{hours}', hours.toString());
      await reply.sendToTopic(message, ctx.message?.reply_to_message?.message_thread_id!);
    } else {
      const hours = randomHours(1, 7);
      const message = getRandomMessage('notReplyingToAnyone').replace('{hours}', hours.toString());
      await reply.send(message);
    }
  }
  /**
   * Sends a message with the content: "We will go to ga".
   * This is a simple, predefined message that might be part of a larger set of group commands.
   * It could be used to inform the group about future plans or events.
   */
  static future(ctx: Context) {
    return new BotReply(ctx).textReply('We will go to ga');
  }
  /**
   * Sends the last post from a specific module or CodeModule.
   * This could be used to inform the group about the latest developments or announcements related to the project.
   * It requires access to the channel to fetch the latest message.
   */
  static async news(ctx: Context) {}
  /**
   * Sends information about the current group the user is in.
   * This command is useful for users to learn more about the group they are interacting with.
   * The information could include the group name, description, and any additional relevant data.
   */
  @RestrictToGroupChats()
  static async groupinfo(ctx: Context) {
    const reply = new BotReply(ctx);
    const chatInfo = new ChatInfo(ctx);
    const groupInfo = await chatInfo.chatInfo();
    const { groupName, groupType, groupDescription, memberCount, admins, inviteLink } = groupInfo!;
    // Create the response message
    const response = `
<b>Group Information:</b>
- <b>Name:</b> ${groupName}
- <b>Type:</b> ${groupType}
- <b>Description:</b> ${groupDescription}
- <b>Members:</b> ${memberCount}
- <b>Admins:</b> ${admins || 'No admins available'}
- <b>Invite Link:</b> ${inviteLink}
      `.trim();

    // Send the response to the chat
    await reply.htmlReply(response);
  }
  /**
   * Sends a message to the group admins.
   * This command allows users to report issues or ask questions directly to the group admins.
   * It’s typically used for urgent matters or when a user needs assistance.
   */
  @ReplyToBot()
  @RestrictToGroupChats()
  @RequireReply()
  static async report(ctx: Context) {
    ReportCommand.report(ctx);
  }
  /**
   * Cancels and deletes a message that was supposed to be sent.
   * This is useful for preventing spam or correcting mistakes before sending the message to the group.
   * It’s a safety measure to ensure that unwanted messages are not posted.
   */
  @RestrictToGroupChats()
  static cancel(ctx: Context) {
    ReportCommand.cancel(ctx);
  }
  /**
   * Sends the link of the group the user is in.
   * This command is useful for users who want to share the group’s link with others.
   * The link can be used to invite others or for reference purposes.
   */
  @RestrictToGroupChats()
  static async link(ctx: Context) {
    const reply = new BotReply(ctx);
    // Fetch the group chat details, which should include the invite link if the bot has the necessary permissions
    const chat = await ctx.api.getChat(ctx.chat!.id);
    if (chat.invite_link) {
      // Send the invite link to the user
      await reply.textReply(`Here is the invite link for this group: ${chat.invite_link}`);
    } else {
      // If no link exists, try to generate a new one (requires admin rights)
      if (chat.permissions?.can_change_info) {
        try {
          // Try to export a new invite link
          const inviteLink = await ctx.api.exportChatInviteLink(ctx.chat!.id);
          await reply.textReply(`Here is the invite link for this group: ${inviteLink}`);
        } catch (err: any) {
          await reply.textReply('Sorry, I do not have permission to generate the invite link.');
        }
      } else {
        await reply.textReply('I do not have enough permissions to generate an invite link.');
      }
    }
  }
  /**
   * Sends a list of admins in the current group.
   * This is helpful for users to know who the admins are, especially in larger groups.
   * Admins can handle issues, provide support, and moderate the group.
   */
  @RestrictToGroupChats()
  static async adminlist(ctx: Context) {
    const reply = new BotReply(ctx);
    const chatinfo = new ChatInfo(ctx);
    // Fetch the list of administrators in the group
    const adminList = await chatinfo.adminList();
    if (adminList) {
      // Send the formatted list of admins to the user
      await reply.htmlReply(`<b>Admins in this group:</b>\n${adminList}`);
    } else {
      await reply.textReply("There are no admins in this group or I couldn't fetch them.");
    }
  }
}
