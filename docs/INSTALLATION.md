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

````
```bash
npm install
````

3. Set Up Environment Variables

Create a `.env` file in the root of your project directory with the following content:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
DB_USER=
DB_HOST=
DB_NAME=
DB_PASSWORD=
DB_PORT=
DB_URL=postgres://username:password@host:port/database_name
DATABASE_URL='' // for production

```

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
