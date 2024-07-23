# CMCOP - Telegram Group Management Bot

[![Telegram](https://img.shields.io/badge/Telegram-Join%20Chat-blue)](https://t.me/CMCOP)

CMCOP is a powerful and flexible group management bot for Telegram, designed to help admins manage and moderate their groups efficiently. The bot offers a variety of features including auto-moderation, welcome messages, role management, automated responses, and more.

## Features

- **Moderation Tools**: Auto-moderation, mute, kick, and ban users.
- **Welcome Messages**: Custom welcome messages for new members.
- **Role Management**: Different roles for admins, moderators, and members.
- **Automated Responses**: Set up responses to frequently asked questions.
- **Logging and Analytics**: Track group activity and generate reports.
- **Anti-spam**: CAPTCHA for new members and spam detection.
- **Command Customization**: Allow admins to add or remove custom commands.

## Getting Started

### Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/m-mdy-m/CMCOP.git
    cd cmcop
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up environment variables. Create a `.env` file in the root directory and add your bot token:

    ```env
    BOT_TOKEN=your_bot_token_here
    ```

4. Start the bot:

    ```bash
    npm start
    ```

## Usage

### Commands

- **/start**: Start interacting with the bot and receive a welcome message.
- **/help**: Get assistance and see the list of available commands.
- **/warn [user]**: Issue a warning to a user.
- **/mute [user] [time]**: Mute a user for a specified time.
- **/ban [user]**: Ban a user from the group.

### Example

To mute a user for 10 minutes, use:

```plaintext
/mute @username 10m
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
