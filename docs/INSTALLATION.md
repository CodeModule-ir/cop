# Installation Guide
This document provides detailed instructions on how to install and set up the Code Module Cop bot for managing Telegram groups.

## Prerequisites
- Node.js (v20.x or higher)
- npm (v6.x or higher)
- Docker (if using Docker installation)
- Mysql (such as Mariadb)
## Installation
### From Source
1. Clone the Repository

```bash
git clone https://github.com/CodeModule-ir/cop.git
cd cop
```
### Install Dependencies
```
```bash
npm install
```

3. Set Up Environment Variables

Create a `.env` file in the root of your project directory with the following content:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
DB_HOST=db
DB_PORT=3306
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
```
- **TELEGRAM_BOT_TOKEN**: Your Telegram bot token.
- **DB_HOST**: The hostname of your database server.
- **DB_PORT**: The port on which your database server is listening.
- **DB_USERNAME**: The username used to access your database.
- **DB_PASSWORD**: The password associated with the database username.
- **DB_NAME**: The name of the database that the bot will use.
4. Start the Bot

```bash
npm start
```

## Docker Installation
You can also run the bot using Docker for easier setup and deployment.

1. Pull the Docker Image

Pull the Docker image from Docker Hub:

```bash
docker pull codemodule/cop
```

2. Run the Docker Container

Run the container with your environment variables:

```bash
docker run -d \
  --name cop \
  --env-file .env \
  codemodule/cop
```

Ensure you have a `.env` file with the necessary environment variables.

3. Using Docker Compose (Optional)

If you prefer using Docker Compose, create a docker-compose.yml file with the following content:

```yaml
version: '3'
services:
  bot:
    image: codemodule/cop
    env_file:
      - .env
    restart: always
```
Then, start the container with:

```bash
docker-compose up -d
```

### Updating
To update the bot, pull the latest changes from the repository or Docker image and rebuild/restart the bot.

```bash
git pull origin main
npm install
npm run build
npm start
```

### For Docker:

```bash
docker pull codemodule/cop
docker-compose down && docker-compose up -d
```

### Additional Scripts

- Stop Docker Containers

```bash
npm run docker:stop
```
- Take Down Docker Containers

```bash
npm run docker:down
```

- Build Docker Images
```bash
npm run docker:build
```
- Run Docker Containers

```bash
npm run docker:run
```
- Start Docker Containers

```bash
npm run docker:start
```
- Compile TypeScript Code

```bash
npm run build
```
- Clean Distribution Directory

```bash
npm run clean
```
- Run Node App
bash
```
npm run main
```