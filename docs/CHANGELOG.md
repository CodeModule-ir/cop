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