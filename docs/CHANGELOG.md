# Changelog

## [1.0.0] - 2024-08-05

### Added
- **Features:**
  - `start`: Sends a welcome message in Piwi and a different message in the group.
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
- `docker:remove`: Stops and removes Docker containers.
- `docker:build`: Builds Docker images.
- `docker:run`: Starts Docker containers.
- `docker:start`: Builds and starts Docker containers.
- `build`: Compiles TypeScript code.
- `test`: Runs tests using Mocha (configuration in `.mochar.json`).
- `start`: Starts the application with `ts-node`.

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