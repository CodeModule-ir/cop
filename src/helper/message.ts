import { User } from "grammy/types";
import { RepliedMessage } from "../types/types";
import { Context } from "grammy";

export class MESSAGE {
  static BAN_USE_BLACKLIST_MSG(user: User) {
    return `@${user.username} (${user.first_name}),\n\nYou have been banned from the group due to the use of inappropriate language. We strive to maintain a respectful environment for all members, and such behavior is not tolerated. If you believe this action was taken in error, please contact the group administrators for further clarification.\n\nThank you for your understanding.`;
  }
  static BAN(user: User) {
    return `@${user.username} (${user.first_name}) has been banned from the group.`;
  }

  static UNBAN(user: User) {
    return `@${user.username} (${user.first_name}) has been unbanned and can rejoin the group.`;
  }

  static MUTE_SET(user: any, expiration: Date | undefined) {
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

  static WARN(msg: RepliedMessage, count: number, reason: string) {
    let message = `@${msg.from?.username} (${msg.from?.first_name}) has been warned. They now have ${count} warning.\nReason: ${reason}\nFor a detailed list of rules, use the command: /rules`;
    if (!reason) {
      message = `@${msg.from?.username} (${msg.from?.first_name}) has been warned. They now have ${count} warning.For a detailed list of rules, use the command: /rules`;
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
Hello! I am your group admin bot, here to help you manage the group more effectively. You can use the following commands:

/help - Display this help message.

/start - Sends a welcome message. If used in Pv, it will provide a different message compared to the group.

/warn <reason> - Issues a warning to the user. If the user accumulates three warnings, they will be automatically banned. Provide a reason for the warning after the command.

/rmWarn - Removes warnings from the specified user.

/mute <duration> - Mutes the user for a specified amount of time. If no duration is specified, the user will be muted indefinitely. Examples:
  /mute 1h -> mute for 1 hour
  /mute 30m -> mute for 30 minutes
  /mute -> mute indefinitely

/unMute - Unmutes a previously muted user.

/ban - Bans the user from the group. This command permanently removes the user from the group.

/unBan - Removes the user from the banned list, allowing them to rejoin the group.

/purge - Deletes recent messages that have been replicated. Useful for cleaning up spam or inappropriate content.

/approved - Grants or revokes special permissions for users. Approved users can use forbidden words, pin messages, and forward content in the group.

/unApproved - Revokes special permissions from the specified user.

/approvedList - Return list Approved Users

/lock [type] - Locks the group to prevent new messages. Can be used with additional options:
  /lock gif -> Lock GIFs
  /lock poll -> Lock Poll
  /lock -> lock group

/unLock [type] - Unlocks the group for specific content. Options include:
  /unLock gif -> Unlock GIFs
  /unLock poll -> Unlock Poll
  /unLock -> unlock group

/blacklist - Returns the current blacklist of words and phrases.

/abl <word/phrase> - Adds a word or phrase to the blacklist. Example usage: /abl test

/rmbl <word/phrase> - Removes a word or phrase from the blacklist. Example usage: /rmbl test

/date - Provides today’s date in both Gregorian and solar calendars.

/future - Sends a predefined message about future plans. The message is: "We will go to ga"

/rules - Returns the current rules of the group. You can also add new rules with /rules <rule> or delete all rules with /rules r

I am here to assist you in managing the group. If you have any questions or need further assistance, just use the commands listed above!
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
    `;
  }
}
