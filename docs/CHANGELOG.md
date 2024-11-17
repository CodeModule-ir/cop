# Changelog

## [1.0.0] - 2024-08-06

### Added

- **Features:**
  - `start`: Sends a welcome message in PV and a different message in the group.
  - `help`: Lists available commands.
  - `warn`: Issues a warning to users; removes users from the group after three warnings.
  - `rmWarn`: Removes warnings from users.
  - `mute`: Silences users.
  - `unMute`: Unsilences users.
  - `ban`: Expels users from the group.
  - `unBan`: Removes users from the banned list.
  - `purge`: Deletes messages that have been replicated.
  - `approved`: Grants users special permissions, such as using forbidden words and pinning messages.
  - `unApproved`: Revokes special permissions from users.
  - `lock`: Locks the group with additional options to lock gifs, stickers, or forwards.
  - `unLock`: Unlocks the group with additional options to unlock gifs or stickers.
  - `blacklist`: Returns the current blacklist.
  - `abl`: Adds a letter or word to the blacklist (e.g., `/abl test`).
  - `rmbl`: Removes a word from the blacklist (e.g., `/rmbl test`).
  - `date`: Provides today’s date in Gregorian and solar calendars.
  - `future`: Sends a predefined message about future plans.
  - `rules`: Returns the group's rules and allows adding (`/rules test`) or deleting all rules (`/rules r`).

### Database and Technology

- **Database:** MySQL
- **ORM:** TypeORM
- **Language:** TypeScript
- **Containerization:** Docker

### Scripts

- `docker:stop`: Stops Docker containers.
- `docker:down`: Down Docker containers.
- `docker:build`: Builds Docker images.
- `docker:run`: Starts Docker containers.
- `docker:start`: Builds and starts Docker containers.
- `build`: Compiles TypeScript code.
- `test`: Runs tests using Mocha (configuration in `.mochar.json`).
- `start`: Starts the application with `ts-node`.
- `clear`: Remove dist directory
- `main`: Run node app if compiles TypeScript code

### Known Issues

- Test functionality is not yet implemented but will be included in the next version.
- This is a test version and may contain bugs.

### Future Plans

- Implement automated tests for improved stability and reliability.
- Enhance bot functionalities based on user feedback.

### Contribution

- Contributions are welcome. Please follow the guidelines provided in the `CONTRIBUTING.md` file for more details on how to contribute.

### License

- This project is licensed under the MIT License.

## [2.0.0] - 2024-08-07

### Added

- **Features:**
  - `approvedList`: Returns the list of approved users.
  - `RATE LIMIT`: Introduced rate limiting for commands to prevent abuse.
  - `Decorator Group Initial`: Added a decorator for initializing the group in case of database deletion, ensuring normal operation.

### Fixed

- **Bug Fixes:**
  - `rmWarn`: Fixed the bug that prevented warnings from being removed correctly.
  - `unApproved`: Fixed the bug where users were not removed from the approved list as expected.
  - `rules`: Fixed the bug where adding a new rule caused the previous rules to be deleted.
  - `purge`: Fixed the bug that limited message deletion to fewer than 200 messages; now supports deleting more messages in a short time.

### Enhancements

- **Logging:**
  - Added loggers to improve the ability to analyze program behavior and track issues.

### Contribution

- Contributions are welcome. Please follow the guidelines provided in the `CONTRIBUTING.md` file for more details on how to contribute.

### License

- This project is licensed under the MIT License.

## [3.0.0] - 2024-08-10

### Added

- **Features:**
  - `aran`: New command with a multi-step process:
    1. "Aran mode: Activated"
    2. "رفرنس بده."
    3. "Aran mode: DeActivated"
  - `codeTime`: New command that provides sarcastic and insulting messages encouraging users to code or telling everyone to code if not replying to anyone.
  - `GroupSettings`: Added `isSpamTime` to show a message during spam time: "بوی اسپم تایم میاد 😋".
  - `Pv Robot`: Added a new message for commands sent to the Pv Robot.

### Fixed

- **Bug Fixes:**
  - `warn`: Fixed issues related to warning functionalities.
  - `approved`: Fixed the bug related to the `approved` command.
  - `unApproved`: Fixed the bug where users were not removed from the approved list as expected.
  - `approvedList`: Fixed bugs related to the `approvedList` command.
  - `/date`: Fixed the bug where the Persian days were not displayed correctly.

### Removed

- **Database Changes:**
  - Removed the `groupMembership` table and its associated code.

### Refactored

- **Code Updates:**
  - `GroupSettings`: Updated to include new fields and methods related to spam time and other settings.
  - `service/db/user`: Updated methods to use dynamic `telegramId` and fixed various issues.
  - `service/command`: Added and updated methods for new commands; cleaned up unnecessary logging.
  - `middleware`: Removed unnecessary logger imports and updated methods.
  - `entities`: Updated `User`, `GroupSettings`, and `Warning` entities; removed `GroupMembership` entity.
  - `command`: Refactored commands to include new functionalities and clean up logic.

### Known Issues

- Some bugs related to deprecated functionalities may still persist but are being actively addressed.

### Future Plans

- Continue improving bot functionalities based on user feedback and addressing remaining bugs.

### License

- This project is licensed under the MIT License.

## [4.0.0] - 2024-11-17

### Breaking Changes:

- Overhauled project structure, transitioning to PostgreSQL from MySQL and TypeORM.
- Removed migration service and migration table schema.
- Removed the `ApprovedUser` and `Blacklist` tables in the database schema.
- Refactored database models and schemas, with changes in primary key annotations and modified data types for tables such as `Group`, `User`, `Warning`, `ApprovedUser`, `Channel`, and `GroupRule`.

### Features:

- **Bot Command Enhancements:**
  - Implemented an advanced user management and moderation system.
  - Added comprehensive admin and chat validation middleware to improve command handling and validation.
  - Integrated new admin commands for better bot management.
  - Added core utilities for command handling, rate limiting, and bot replies.
  - Implemented a registration system for commands using the `GenerateCommand` class.
  - Added report and cancel commands for user moderation.
  - Developed a welcome message management and warnings system for group chats.
- **Database and Services:**

  - Introduced the `ServiceProvider` class to centralize database access and service management.
  - Added `DatabaseService`, `MembersService`, `TablesService`, and `GroupRuleService` for enhanced group management and database operations.
  - Updated database schema to add `created_at` and `updated_at` columns to `User` and `Group` tables.
  - Added a database connection pool and automatic database initialization.
  - Refactored database services for improved scalability and performance.

- **Error Handling:**

  - Implemented a `Catch` decorator for centralized error handling in asynchronous methods across the application.

- **Middleware:**

  - Added middleware to validate group chats and check bot/admin permissions for user and admin commands.

- **Miscellaneous:**
  - Refined bot service logic and removed unnecessary console logs.
  - Removed blacklist.json file and refactored related bot logic.
  - Improved handling of user restrictions and blacklisted words.
  - Added support for handling Persian and Gregorian dates.

### Refactoring:

- Refined the `BotReply` and `ChatInfo` classes to improve command processing and responses.
- Refactored `CopBot` to use `ServiceProvider` for database initialization and added new admin command functionality.
- Refined the `Catch` decorator to handle errors in a more structured manner.
- Updated `BotMiddleware` for more granular control over command execution flow.

### Bug Fixes:

- Fixed issue with bot command registration and execution flow.
- Removed unused imports and methods, such as `forwardChannelPostToGroup`.
- Fixed errors related to missing fields in the database schema.
