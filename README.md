# CMCOP - Telegram Group Management Bot

[![Telegram](https://img.shields.io/badge/Telegram-Join%20Chat-blue)](https://t.me/CMCOP)

CMCOP is a powerful and flexible group management bot for Telegram and a dedicated [CodeModule](https://t.me/CodeModule) bot designed to help admins manage and moderate their groups effectively. This bot offers various features including welcome messages, role management, auto replies, and more.

## Features

- **Moderation Tools**: Mute and ban users with automated handling of warnings.
- **Welcome Messages**: Custom welcome messages for new members.
- **Role Management**: Manage roles for admins, moderators, and members.
- **Automated Responses**: Set up responses to frequently asked questions.
- **Logging and Analytics**: Track group activity and generate reports.
- **Command Customization**: Allow admins to add or remove custom commands.

## Getting Started

### Prerequisites

- Node.js (v20.x or higher)
- npm (v6.x or higher)

### Installation

#### From Source

1. Clone the repository:

    ```bash
    git clone https://github.com/m-mdy-m/CMCOP.git
    cd cmcop
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. **Set Up Environment Variables**

   The bot requires specific environment variables to run correctly. These are stored in a `.env` file in the root directory of your project. This file should not be committed to version control, so ensure it is listed in your `.gitignore`.

   Create a `.env` file in the root of your project directory with the following content:

    ```env
    TELEGRAM_BOT_TOKEN=your_bot_token_here
    DB_HOST=db
    DB_PORT=3306
    DB_USERNAME=your_db_username
    DB_PASSWORD=your_db_password
    DB_NAME=your_db_name
    ```
   - **TELEGRAM_BOT_TOKEN**: Your Telegram bot token. You can obtain this by creating a bot on Telegram and getting the token from BotFather.
   - **DB_HOST**: The hostname of your database server. If you are running the database locally, this is often `localhost`. In containerized setups, this might be a service name like `db`.
   - **DB_PORT**: The port on which your database server is listening. For MySQL, this is typically `3306`.
   - **DB_USERNAME**: The username used to access your database.
   - **DB_PASSWORD**: The password associated with the database username.
   - **DB_NAME**: The name of the database that the bot will use.

4. **Start the Bot**

   With the environment variables set, you can start the bot:

    ```bash
    npm start
    ```

#### Docker Installation

You can also run CMCOP using Docker. This method allows you to quickly deploy the bot without needing to manually set up dependencies.

1. **Pull the Docker Image**

   To pull the latest Docker image from Docker Hub:

    ```bash
    docker pull mahdi83/cmcop-bot
    ```

2. **Run the Docker Container**

   Run the container with the required environment variables. You can use a `.env` file to pass these variables:

    ```bash
    docker run -d \
      --name cmcop-bot \
      --env-file .env \
      mahdi83/cmcop-bot
    ```

   If you need to link the container to a database container, you can use Docker Compose or specify additional environment variables directly in the `docker run` command.

## Usage

### Commands

- **/start**: Start interacting with the bot and receive a welcome message.
- **/help**: Get assistance and see the list of available commands.
- **/warn [reason]**: Issue a warning to a user. If a user accumulates three warnings, they will be automatically banned.
- **/mute [time]**: Mute a user for a specified duration. Time can be specified in minutes (m), hours (h), or indefinitely.
- **/ban**: Ban a user from the group permanently.

### Example

To mute a user for 10 minutes, use:

```plaintext
/mute 10m  (You must reply to the user.)
```

## Contributing

We welcome contributions from the community! To help us maintain the quality and consistency of the project, please follow these guidelines:

**Read the Contributing Guidelines**: Before you start, please read our [CONTRIBUTING.md](./docs/CONTRIBUTING.md) file. It contains important information about how to contribute, including coding standards, how to set up your development environment, and the process for submitting changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
