import { Context } from 'grammy';
import { Catch } from '../../../decorators/Catch';
import { BotReply } from '../../../utils/chat/BotReply';
import { help, start, commands } from '../../../utils/jsons/botMessages.json';
import { ChatInfo } from '../../../utils/chat/ChatInfo';
import { DateCommand } from '../../service/general/date';
import { info, user_support } from '../../../../docs/BotInfo.json';
/**
 * Reason for lowercase command names:
 *
 * Since the names of all commands are written in lowercase for uniformity,
 * and the commands are automatically generated, I needed to ensure that commands
 * can be triggered in any case (e.g., "getBotInfo", "Getbotinfo", or "getbotinfo").
 * To achieve this, I converted all command names to lowercase.
 * This way, the system can recognize commands regardless of the case
 * the user enters, providing a consistent user experience.
 *
 * Code for handling case-insensitivity bot/bot.ts
 */
export class GeneralCommands {
  static getMessage(ctx: Context): { commands: string; help: string; start: string } {
    const chatInfo = new ChatInfo(ctx);
    const chattype = chatInfo.getChatType();
    if (chattype === 'private') {
      return {
        help: help.general,
        commands: commands.private,
        start: start.Private,
      };
    }
    return {
      commands: commands.public,
      help: help.general,
      start: start.gorup,
    };
  }
  // === General Command Handlers ===
  @Catch({
    message: 'Error displaying help message. Please try again later.',
    category: 'Bot',
    statusCode: 500,
  })
  public static async help(ctx: Context) {
    const reply = new BotReply(ctx);
    const { help } = GeneralCommands.getMessage(ctx);
    const sanitizedHelp = help.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
    await reply.markdownReply(sanitizedHelp);
  }

  @Catch({
    message: 'Error starting the bot. Please try again later.',
    category: 'Bot',
    statusCode: 500,
  })
  public static async start(ctx: Context) {
    const reply = new BotReply(ctx);
    const { start } = GeneralCommands.getMessage(ctx);
    await reply.textReply(start);
  }

  @Catch({
    message: 'Error retrieving the date. Please try again later.',
    category: 'Bot',
    statusCode: 500,
  })
  public static async date(ctx: Context) {
    const reply = new BotReply(ctx);
    const { gregorianDate, persianDate } = await DateCommand.date();
    const message = `
🌍 **Gregorian Date**:
  ${gregorianDate}

🌍 **Persian Date**:
  ${persianDate}
`;
    reply.markdownReply(message);
  }

  static async commands(ctx: Context) {
    const reply = new BotReply(ctx);
    const { commands } = GeneralCommands.getMessage(ctx);
    await reply.textReply(commands);
  }
  @Catch({
    message: 'Error retrieving support contact information. Please try again later.',
    category: 'Bot',
    statusCode: 500,
  })
  /** viewSupportContact */
  public static async viewsupportcontact(ctx: Context) {
    const reply = new BotReply(ctx);

    // Contact information from BotInfo.json
    const contactMessage = `
**Help Contact**: ${user_support.help_contact}\n\r
**Support Email**: ${user_support.support_email}
**Support Groups**:
    ${user_support.support_groups.map((group) => `- ${group.name}: ${group.link}`).join('\n')}

Please reach out to us for assistance.
    `;
    await reply.markdownReply(contactMessage);
  }
  @Catch({
    message: 'Error retrieving bot information. Please try again later.',
    category: 'Bot',
    statusCode: 500,
  })
  /** getBotInfo */
  public static async getbotinfo(ctx: Context) {
    const reply = new BotReply(ctx);

    // Extract detailed information from BotInfo.json
    const botInfoMessage = `
    **Bot Information**:
    - **Name**: ${info.bot_name}
    - **Version**: ${info.bot_version}
    - **Status**: ${info.bot_status}
    - **Creation Date**: ${new Date(info.created_at).toLocaleString()}
    - **Last Updated**: ${new Date(info.last_update).toLocaleString()}
    - **Supported Languages**: ${info.supported_languages.join(', ')}

**Description**: ${info.description}
    
This bot is designed to deliver fast and secure responses to users.
    `;
    await reply.markdownReply(botInfoMessage);
  }
}
