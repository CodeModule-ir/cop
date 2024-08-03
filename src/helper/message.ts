import { User } from "grammy/types";
import { RepliedMessage } from "../types/types";
import { Context } from "grammy";

export class MESSAGE {
  static BAN(user: User) {
    return `@${user.username} (${user.first_name}) has been banned from the group.`;
  }

  static UNBAN(user: User) {
    return `@${user.username} (${user.first_name}) has been unbanned and can rejoin the group.`;
  }

  static MUTE_SET(user: any, expiration: Date | undefined) {
    console.log("user:", user);
    
    const expirationText = expiration
      ? `until ${expiration.toLocaleString()}`
      : "indefinitely";
    return `@${user.username} (${user.first_name}) has been muted ${expirationText}.`;
  }

  static MUTE_CLEAR(user: User) {
    return `The mute for @${user.username} (${user.first_name}) has been lifted.`;
  }

  static NO_MUTES() {
    return "This user has no active mutes.";
  }

  static WARN(msg: RepliedMessage,count:number, reason: string) {
    let message = `@${msg.from?.username} (${msg.from?.first_name}) has been warned. They now have ${count} warning.\nReason: ${reason}\nFor a detailed list of rules, use the command: /rules`;
    if(!reason){
      message =  `@${msg.from?.username} (${msg.from?.first_name}) has been warned. They now have ${count} warning.For a detailed list of rules, use the command: /rules`;
    }
    return message;
  }
  static WARNING_CLEARED(user: string, usernameAdmin: string) {
    return `Warnings for @${user} have been cleared by @${usernameAdmin}. Please review the group rules with /rules. Thank you for contributing to a positive community!`;
  }
  static NO_WARNINGS() {
    return "This user has no warnings.";
  }
  static WARN_CLEAR() {
    return `The warnings for the user have been successfully cleared.`;
  }
  static HELP() {
    return `
Hello! I am a group admin bot! You can use these commands to manage the group better:

/help - Display this help message.

/warn <reason> - adds a warning to the user. If the user reaches three warnings, he will be automatically banned. Enter the reason for the warning after the command.

/mute <duration> - mutes the user for a specified amount of time. If you do not specify a duration, the user will be muted indefinitely. Examples:
 /mute 1h -> mute for 1 hour
 /mute 30m -> Mute for 30 minutes
 /mute -> mute indefinitely

/ban - Bans the user from the group. This command permanently removes the user from the group.

/purge - Clears recent messages in the group. It is usually used to delete inappropriate or spam messages.

/approved - Manages approved users. With this command, you can view or manage the list of approved users.

/lock []- Lock the group to prevent new messages from being sent. This command is useful when you need to relax in a group.

/blacklist <word/phrase> - Adds specific words or phrases to the blacklist. If a user uses these words in their messages, they will be automatically warned or muted.

I am always ready to help you manage the group better. If you have any questions or need more help, just use the commands above!
`;
  }
  static PV_START() {
    return `Welcome to CMCOP!
I am the dedicated robot and police of Codemodule community.

Use the /help command to explore my features and commands.`;
  }
  static START() {
    return "Hello! What can I do?";
  }
  static newGroupJoin(ctx: Context, inviterUsername: string) {
    return `
      Hello ${ctx.chat?.title}!
First of all, thanks to @${inviterUsername} for inviting me to this awesome group!
I'm here to help out and make sure everyone has a good time. Are you curious about what I can do? Just type the /help command.
    `;}
}
