# Usage Guide

This document provides detailed instructions on how to use the Code Module Cop bot for managing Telegram groups.

## Commands

### General Commands

- **/start**: Start interacting with the bot.
- **/help**: Get help and see the list of available commands.
- **/commands**: List all commands of the bot.
- **/date**: Get the current date and time.
- **/joke**: Get a random joke.
- **/support**: View support contact details.
- **/botinfo**: Get information about the bot.

### Group Management Commands

- **/rules**: View the group rules.
- **/codetime**: Says a random word sarcastically or offensively to you or people in the group.
- **/future**: Get insights about the future.
- **/groupinfo**: View information about the group.
- **/report**: Report an issue or a user.
- **/cancel**: Cancel the current report.
- **/link**: Generate or view group links.
- **/adminlist**: View the list of group admins.
- **/grant**: Grant admin privileges to a user.
- **/revoke**: Revoke admin privileges from a user.
- **/pin**: Pin a message in the group.
- **/unpin**: Unpin the pinned message.
- **/purge**: Delete a range of messages.
- **/welcome**: Returns the current group welcome message.

### Moderation Commands

- **/approved**: Approve a user for special privileges.
- **/disapproved**: Remove approval for a user.
- **/approvedlist**: View the list of approved users.
- **/ban**: Ban a user from the group.
- **/unban**: Unban a previously banned user.
- **/warn**: Issue a warning to a user.
- **/rmwarn**: Remove a warning from a user.
- **/warns**: Check warnings for a user.
- **/warnslist**: View the list of all warnings.
- **/mute**: Mute a user in the group.
- **/unmute**: Unmute a previously muted user.

### Blacklist Commands

- **/blacklist**: Add a word or phrase to the blacklist.
- **/abl**: Add multiple words to the blacklist.
- **/rmbl**: Remove a word or phrase from the blacklist.
- **/clrbl**: Clear the blacklist.

### Shahin and Aran-Specific Commands

- **/shahin**: Trigger Shahin-specific functionality.
- **/aran**: Trigger Aran-specific functionality.

---

## Example Commands

### Mute a User for 10 Minutes

To mute a user for 10 minutes:

```plaintext
/mute 10m
(You must reply to the user you want to mute.)
```

### Issue a Warning to a User

To issue a warning to a user with a reason:

```plaintext
/warn Spamming the chat
(You must reply to the user you want to warn.)
```

### Ban a User

To ban a user from the group:

```plaintext
/ban
(You must reply to the user you want to ban.)
```

### Unban a User

To unban a user from the group:

```plaintext
/unban
(You must specify the user to unban.)
```
