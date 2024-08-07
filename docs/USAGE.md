# Usage Guide
This document provides detailed instructions on how to use the Code Module Cop bot for managing Telegram groups.

## Commands
### General Commands
- /start: Start interacting with the bot and receive a welcome message.
- /help: Get assistance and see the list of available commands.
## Moderation Commands
- /warn [reason]: Issue a warning to a user. If a user accumulates three warnings, they will be automatically banned.
- /rmWarn: Removes warnings from users.
- /mute [time]: Mute a user for a specified duration. Time can be specified in minutes (m), hours (h), or indefinitely.
- /unMute: Unsilences users.
- /ban: Ban a user from the group permanently.
- /unBan: Removes users from the banned list.
- /purge: Deletes messages that have been replicated.
## Role Management Commands
- /approved: Grants users special permissions, such as using forbidden words and pinning messages.
- /unApproved: Revokes special permissions from users.
- /approvedList: Return All Approved user
### Group Management Commands
- /lock: Locks the group with additional options to lock gifs, stickers, or forwards.
- /unLock: Unlocks the group with additional options to unlock gifs or stickers.
- /blacklist: Returns the current blacklist.
- /abl [word]: Adds a letter or word to the blacklist (e.g., /abl test).
- /rmbl [word]: Removes a word from the blacklist (e.g., /rmbl test).
### Information Commands
- /date: Provides today’s date in Gregorian and solar calendars.
- /future: Sends a predefined message about future plans.
- /rules: Returns the group's rules and allows adding (/rules test) or deleting all rules (/rules r).
## Examples
### Mute a User for 10 Minutes

#### To mute a user for 10 minutes, use:

```plaintext
/mute 10m
(You must reply to the user you want to mute.)
```
#### Issue a Warning to a User
To issue a warning to a user with a reason, use:

```plaintext
/warn Spamming the chat
(You must reply to the user you want to warn.)
```
#### Ban a User
To ban a user from the group, use:

```plaintext
/ban
(You must reply to the user you want to ban.)
```
#### Unban a User
To unban a user from the group, use:

```plaintext
/unBan
(You must specify the user to unban.)
```