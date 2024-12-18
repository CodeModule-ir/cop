import { Context } from 'grammy';
import { ServiceProvider } from '../database/ServiceProvider';
import { BotReply } from '../../utils/chat/BotReply';
import { ChatInfo } from '../../utils/chat/ChatInfo';
import logger from '../../utils/logger';
import { MessageEntity } from 'grammy/types';
export class MessagesService {
  private _reply: BotReply;
  private _chatInfo: ChatInfo;
  constructor(private _ctx: Context) {
    this._reply = new BotReply(_ctx);
    this._chatInfo = new ChatInfo(_ctx);
  }
  private isText(): boolean {
    if (!this._ctx.message?.text) {
      logger.warn('Message text is undefined');
      return false;
    }
    return true;
  }

  async isCode() {
    if (!this.isText()) return;
    const entities = this._ctx.message!.entities;
    entities?.forEach((e) => {
      if (e.type === 'pre' && e.language) {
        this._reply.textReply(`Your code is garbage.\n\n- Linus Torvalds`);
      }
    });
  }
  async isNewUser() {
    if (!this.isText()) return;
    if (this._ctx.message?.new_chat_members?.length! > 0) {
      const users = this._ctx.message!.new_chat_members!;
      const chat = this._ctx.chat;
      const service = ServiceProvider.getInstance();
      const groupService = await service.getGroupService();
      if (!groupService) {
        return;
      }
      let group = await groupService.getByGroupId(chat!.id);
      if (!group) {
        group = await groupService.save(this._ctx);
      }
      let welcome_message = group.welcome_message;
      if (!welcome_message) {
        welcome_message = `Welcome to ${this._ctx.chat!.title}\n\nWe are so glad to have you here!. If you have any questions, don't hesitate to ask! 💬\n\nEnjoy your time here!`;
      }
      for (const user of users) {
        if (user.id !== this._ctx.me?.id) {
          await groupService.updateMembers(this._ctx.chat!.id!, this._ctx.from?.id!, this._ctx);
          await this._reply.send(welcome_message);
        }
      }
    }
  }
  async userIsLeftGroup() {
    if (!this.isText()) return;
    if (this._ctx.message?.left_chat_member) {
      const user = this._ctx.message.left_chat_member!;

      if (user.id !== this._ctx.me?.id) {
        // Notify the group about the member leaving
        const username = user.username ? `${user.username}` : user.first_name;
        await this._ctx.reply(`${username} has left the chat.`);
      }
    }
  }

  async checkAndHandleBlacklistedWords() {
    if (!this.isText()) return;
    const groupId = this._ctx.chat?.id;
    if (!groupId) {
      return;
    }
    const messageText = this._ctx.message?.text;
    const messageId = this._ctx.message?.message_id;
    const userId = this._ctx.message?.from?.id;

    if (!messageText || !messageId || !userId) {
      return;
    }
    const service = ServiceProvider.getInstance();
    const [groupService] = await Promise.all([service.getGroupService()]);
    if (!groupService) {
      return;
    }
    let group = await groupService.getByGroupId(groupId);
    if (!group) {
      group = await groupService.save(this._ctx);
    }
    const approvedUsers = group.approved_users.map(Number);
    const isAdmin = await this._chatInfo.isAdmin(userId);
    // Allow approved users and admins to bypass blacklist checks
    if (approvedUsers.includes(+userId) || isAdmin) {
      return;
    }
    const blacklist = group.black_list;
    const isForbidden = blacklist.some((word: string) => {
      const regex = new RegExp(`(^|\\s)${word}($|\\s|[.,!?;])`, 'i'); // \b is a word boundary, 'i' is for case-insensitive matching
      return regex.test(messageText);
    });
    if (isForbidden) {
      await this._ctx.restrictChatMember(
        userId,
        {
          can_send_messages: false,
          can_send_polls: false,
          can_send_other_messages: false,
          can_add_web_page_previews: false,
          can_send_photos: false,
          can_send_audios: false,
        },
        { until_date: Math.floor(Date.now() / 1000) + 3600 }
      );
      await this._ctx.deleteMessage();
      const warningMessage = await this.generateBlacklistWarningMessage(this._ctx, blacklist);
      await this._reply.send(warningMessage);
    }
  }

  private async generateBlacklistWarningMessage(ctx: Context, blacklist: string[]): Promise<string> {
    const info_user = ctx.message?.from?.username || ctx.message?.from.first_name;
    const messageText = this._ctx.message?.text;
    // Function to mask forbidden words and return the modified message
    const maskForbiddenWords = (message: string, blacklist: string[]): string => {
      let maskedMessage = message;
      blacklist.forEach((word) => {
        const regex = new RegExp(`(^|\\s)${word}($|\\s|[.,!?;])`, 'i');
        maskedMessage = maskedMessage.replace(regex, (match) => {
          return match.replace(new RegExp(word, 'i'), '**');
        });
      });
      return maskedMessage;
    };

    // Function to check message for forbidden words and return line number if applicable
    const getLineNumber = (message: string, blacklist: string[]): number | null => {
      const lines = message.split('\n'); // Split message into lines
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isForbidden = blacklist.some((word) => {
          const regex = new RegExp(`(^|\\s)${word}($|\\s|[.,!?;])`, 'i');
          return regex.test(line);
        });
        if (isForbidden) {
          return i + 1; // Return the 1-based index of the line
        }
      }
      return null; // Return null if no forbidden words are found
    };
    // Sending the warning with the line number and masked message
    const lineNumber = getLineNumber(messageText!, blacklist);
    const maskedMessage = maskForbiddenWords(messageText!, blacklist);

    let warningMessage = `
⚠️ Warning, ${info_user}! 

You have used a forbidden word from the blacklist in your message. As a result, you have been temporarily muted for 1 hour. 

This action has been taken to maintain a respectful and safe environment for everyone in the group.

Please be mindful of your language and refrain from using inappropriate words. Repeated violations may result in further actions.

Here is the message you sent (with forbidden words masked):
_"${maskedMessage}"_

We appreciate your understanding and cooperation in keeping the community welcoming for all members. Thank you!
`;

    if (lineNumber !== null) {
      warningMessage += `\n\n⚠️ Forbidden word detected on line ${lineNumber}.`;
    }
    return warningMessage;
  }
  async askCommand() {
    if (!this.isText()) return;
    const messageText = this._ctx.message?.text?.toLowerCase().trim();
    if (messageText !== 'ask' || !this._ctx.message?.reply_to_message?.from) {
      return;
    }
    const user = this._ctx.message?.reply_to_message?.from!;
    const name = user.username ? `@${user.username}` : user.first_name;
    const responseMessage = `Dear ${name}, ask your question correctly.\nIf you want to know how to do this, read the article below:\ndontasktoask.ir`;
    logger.debug(`Sending ask command response to ${name}`);
    await this._reply.textReply(responseMessage);
  }
  async executeCommand() {
    if (!this.isText()) return;
    const isCommand = this.checkIfCommand();
    if (!isCommand) {
      logger.debug('Non-command message received. Ignoring.');
      return;
    }
    const messageText = this._ctx.message?.text?.toLowerCase().trim()!;
    const command = this.parseCommand(messageText, this._ctx.message?.entities)!;
    logger.debug(`Attempting to execute the command: ${command}`);
    const [GeneralCommands, UserCommands, AdminCommands] = await Promise.all([
      import('../../bot/commands/genearl/GeneralCommands').then((module) => module.GeneralCommands),
      import('../../bot/commands/user/UserCommands').then((module) => module.UserCommands),
      import('../../bot/commands/admin/AdminCommands').then((module) => module.AdminCommands),
    ]);
    const handler = (GeneralCommands as any)[command] || (UserCommands as any)[command] || (AdminCommands as any)[command];

    if (typeof handler === 'function') {
      try {
        await handler(this._ctx);
      } catch (err: any) {
        logger.error(`Handler for command "${command}" threw an error: ${err.message}`);
        await this._reply.textReply('An error occurred while processing your command.');
      }
    } else {
      logger.warn(`No handler found for command: ${command}`);
    }
  }
  private checkIfCommand(): boolean {
    const isCommand = this._ctx.message?.entities?.some((entity) => entity.type === 'bot_command');
    if (!isCommand) {
      logger.debug('Message does not contain a command entity.');
      return false;
    }
    return true;
  }
  private parseCommand(messageText: string, entities?: MessageEntity[]): string | null {
    if (entities) {
      const commandEntity = entities.find((entity) => entity.type === 'bot_command');

      if (commandEntity) {
        let command = messageText.split(' ')[0].replace('/', '');
        command = command.includes('@') ? command.split('@')[0] : command;

        logger.debug(`Parsed command: ${command}`);
        return command;
      }
    }

    logger.warn('No command entity found in the message.');
    return null;
  }
}
