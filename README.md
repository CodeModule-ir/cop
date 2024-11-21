# Code Module Cop - Telegram Group Management Bot

[![Telegram](https://img.shields.io/badge/Telegram-Join%20Chat-blue)](https://t.me/cmcopbot)
[![MIT License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.x-brightgreen)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-%3E%3D6.x-orange)](https://www.npmjs.com/)

**Code Module Cop** is a powerful and flexible Telegram bot designed for managing and moderating Telegram groups. This bot provides a set of advanced features such as role management, automated moderation, logging, and more, helping administrators manage their groups efficiently. It is built with the aim of streamlining group moderation and automating tasks that would otherwise require manual intervention.

For more information, join our [Telegram Group](https://t.me/cmcopbot) or check out the [CodeModule](https://t.me/CodeModule) bot!

## Features

### 🔒 Moderation Tools

- Mute and ban users with automated warnings.
- Automated handling of rule violations.

### 🎉 Welcome Messages

- Fully customizable welcome messages for new members.

### 🛡️ Role Management

- Assign and manage roles for admins, moderators, and members.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v20.x or higher)
- [npm](https://www.npmjs.com/) (v6.x or higher)

### Installation

1. **Clone the repository**:

   First, clone the repository to your local machine:

   ```bash
   git clone https://github.com/CodeModule-ir/cop.git
   cd cmcop
   ```

2. **Install dependencies**:

   Install the necessary dependencies via npm:

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   The bot requires environment variables to function correctly. Create a `.env` file in the root directory of your project and add the following variables:

   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_NAME=your_db_name
   DB_PORT=5432
   DB_URL=postgres://your_db_user:your_db_password@localhost:5432/your_db_name
   DATABASE_URL=postgresql://your_db_user:your_db_password@host:port/database_name // Production
   PORT=3000
   WEB_HOOK=https://your-webhook-url-here
   NODE_ENV=development
   ```

   > Note: Be sure to replace placeholders like `your_bot_token` and `your_db_user` with your actual values. The `.env` file should **never** be committed to version control.

4. **Start the Bot**

   Once the environment variables are set, you can start the bot by running the following command:

   ```bash
   npm start
   ```

   This will run the bot in **development mode**. For production deployment, set the `NODE_ENV` to `production`.

   For additional installation instructions, check the [INSTALLATION.md](./docs/INSTALLATION.md) file.

## Usage

### Commands

Below are the most commonly used commands in Code Module Cop:

- **/start**: Start interacting with the bot and receive a welcome message.
- **/help**: Display available commands and their descriptions.
- **/warn [reason]**: Issue a warning to a user. Accumulating three warnings will result in an automatic ban.
- **/mute [time]**: Mute a user for a specified time. Time can be in minutes (e.g., 10m), hours (e.g., 2h), or indefinitely.
- **/ban**: Ban a user from the group permanently.

### Example

To mute a user for 10 minutes, use:

```plaintext
/mute 10m  (Reply to the user you want to mute.)
```

For more detailed usage instructions, refer to the [USAGE.md](./docs/USAGE.md) file.

## Development

Running in Development Mode
To run the bot in development mode, use:

```bash
npm run start
```

This starts the bot with ts-node for TypeScript support and includes stack traces for debugging.

## Contributing

We welcome contributions to improve Code Module Cop. Before you start contributing, please review our [CONTRIBUTING.md](./docs/CONTRIBUTING.md) file. This document contains important guidelines regarding our coding standards, how to set up your development environment, and the process for submitting changes.

Please ensure that your contributions adhere to the project's coding guidelines and include proper test coverage where necessary.

## License

Code Module Cop is open-source and licensed under the **MIT License**. You can read more about the license in the [LICENSE](LICENSE) file.

## Acknowledgments

- [Grammy](https://grammy.dev) - A library for building Telegram bots.
- [Node.js](https://nodejs.org) - The runtime environment for this bot.
- [PostgreSQL](https://www.postgresql.org) - The database used to store user data and group logs.

## Support

Need help? Join our [Telegram Chat](https://t.me/cmcopbot) or [open an issue in the GitHub Repository](https://github.com/CodeModule-ir/cop/issues).
