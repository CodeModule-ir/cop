import { User } from "grammy/types";
import { RepliedMessage } from "../types/types";

export class MESSAGE {
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

  static WARN(msg: RepliedMessage) {
    return `@${msg.from?.username} (${msg.from?.first_name}) has been warned. They now have 1 warning.\nFor a detailed list of rules, use the command: /rules`;
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
  static ME(user: User, isAdmin: boolean, count: number) {
    return `<b>User Information:</b>\n
<strong>ID:</strong> ${user.id}\n
<strong>Name:</strong> ${user.first_name} ${
      user.last_name ? user.last_name : ""
    }\n
<strong>Username:</strong> @${user.username ?? "N/A"}\n
<strong>Status:</strong> ${isAdmin ? "Admin" : "Member"}\n
<strong>Number of Warnings:</strong> ${count ?? 0}\n`;
  }
  static HELP() {
    return `
Welcome to **CMCOP** Here are the commands you can use:
  - /start: Start interacting with the bot and receive a welcome message.
  - /help: Get assistance and see the list of available commands.
  - /warn: Issue a warning to a user.
  - /mute [time]: Mute a user for a specified time.
  - /ban [user]: Ban a user from the group.
  - /admins: List all admins in the chat.
  - /addcommand [command] [response]: Add a custom command.
`;
  }
  static START() {
    return "Hello! I’m CMCOP, your friendly group management assistant. Use /help to see what I can do!";
  }
}
