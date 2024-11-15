import { Context } from 'grammy';
import { BotReply } from '../../../utils/chat/BotReply';
import { RoastMessages } from '../../../types/CommandTypes';
import * as roastMessages from '../../../utils/jsons/roast.json';
import { ReportCommand } from './ReportCommand';
import { ServiceProvider } from '../../../service/database/ServiceProvider';
export class UserCommands {
  /**
   * Sends the rules of the group.
   * This command retrieves and sends the rules of the current group to the user.
   * It helps ensure that group members are aware of the guidelines for interaction.
   */
  static async rules(ctx: Context) {
    const reply = new BotReply(ctx);
    const groupService = await ServiceProvider.getInstance().getGroupService();

    const input = ctx.message?.text!.split(/\s+/).slice(1);
    const action = input![0]?.toLowerCase();
    const ruleContent = input!.join(' ');
    if (!action) {
      // Default behavior: Display all rules
      const rulesMessage = await groupService.getRules(ctx.chat?.id!);
      if (rulesMessage.length === 0) {
        await reply.markdownReply('No rules have been set for this group.');
      } else {
        await reply.markdownReply(rulesMessage.join('\n'));
      }
      return;
    }

    if (action === 'lr') {
      // Delete the last rule
      const updatedRules = await groupService.deleteLastRule(ctx.chat?.id!);
      if (!updatedRules) {
        await reply.markdownReply('No rules to delete.');
      } else {
        await reply.markdownReply('Last rule has been deleted.');
      }
    } else if (action === 'r') {
      // Clear all rules
      await groupService.clearRules(ctx.chat?.id!);
      await reply.markdownReply('All rules have been deleted.');
    } else {
      // Add a new rule
      if (!ruleContent) {
        await reply.markdownReply('Please provide a rule to add.');
        return;
      }
      await groupService.addRule(ctx.chat?.id!, ruleContent);
      await reply.markdownReply(`Rule added: "${ruleContent}"`);
    }
  }
  /**
   * Sends a humiliating message when the /codetime command is triggered by a group member
   * or when someone replies to the bot with this command.
   * This is typically used for fun purposes,
   */
  static async codetime(ctx: Context) {
    const user = ctx.from;
    if (!user) return;
    const reply = new BotReply(ctx);

    const targetUser = ctx.message?.reply_to_message?.from;

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
  static async groupinfo(ctx: Context) {
    const group = ctx.chat;
    const reply = new BotReply(ctx);
    // Ensure we are in a group context
    if (!group || (group.type !== 'group' && group.type !== 'supergroup')) {
      await reply.send('This command can only be used in groups.');
      return;
    }

    // Fetch detailed chat information from Telegram API if necessary
    const chatDetails = await ctx.api.getChat(group.id);

    // Extract information
    const groupName = chatDetails.title || 'Unnamed Group';
    const groupDescription = chatDetails.description || 'No description available';
    const groupType = chatDetails.type === 'supergroup' ? 'Supergroup' : 'Group';
    const memberCount = await ctx.api.getChatMemberCount(group.id);
    const inviteLink = chatDetails.invite_link || 'Invite link not available';
    const creator = await ctx.api.getChatAdministrators(group.id);
    const adminList = creator.filter((admin) => admin.status === 'administrator' || admin.status === 'creator');

    // Format admin list
    const admins = adminList
      .map((admin) => {
        const username = admin.user.username ? `@${admin.user.username}` : admin.user.first_name;
        return `${username} (${admin.status === 'creator' ? 'Creator' : 'Admin'})`;
      })
      .join(', ');

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
  static async report(ctx: Context) {
    ReportCommand.report(ctx);
  }
  /**
   * Cancels and deletes a message that was supposed to be sent.
   * This is useful for preventing spam or correcting mistakes before sending the message to the group.
   * It’s a safety measure to ensure that unwanted messages are not posted.
   */
  static cancel(ctx: Context) {
    ReportCommand.cancel(ctx);
  }
  /**
   * Sends the link of the group the user is in.
   * This command is useful for users who want to share the group’s link with others.
   * The link can be used to invite others or for reference purposes.
   */
  static async link(ctx: Context) {
    const reply = new BotReply(ctx);
    // Fetch the group chat details, which should include the invite link if the bot has the necessary permissions
    const chat = await ctx.api.getChat(ctx.chat!.id);
    if (chat.invite_link) {
      // Send the invite link to the user
      await reply.textReply(`Here is the invite link for this group: ${chat.invite_link}`);
    } else {
      // If no link exists, try to generate a new one (requires admin rights)
      const inviteLink = await ctx.api.exportChatInviteLink(ctx.chat!.id);
      await reply.textReply(`Here is the invite link for this group: ${inviteLink}`);
    }
  }
  /**
   * Sends a list of admins in the current group.
   * This is helpful for users to know who the admins are, especially in larger groups.
   * Admins can handle issues, provide support, and moderate the group.
   */
  static async adminlist(ctx: Context) {
    const reply = new BotReply(ctx);
    // Fetch the list of administrators in the group
    const admins = await ctx.api.getChatAdministrators(ctx.chat!.id);
    const adminList = admins
      .filter((admin) => !admin.user.is_bot) // Exclude bots from the admin list
      .map((admin) => `- ${admin.user.first_name} (@${admin.user.username || 'No username'})`)
      .join('\n');

    if (adminList) {
      // Send the formatted list of admins to the user
      await reply.htmlReply(`<b>Admins in this group:</b>\n${adminList}`);
    } else {
      await reply.textReply("There are no admins in this group or I couldn't fetch them.");
    }
  }
}