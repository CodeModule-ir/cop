# Installation Guide for Code Module Cop

This document provides detailed instructions on how to install and set up the **Code Module Cop** bot for managing Telegram groups.

## Prerequisites

Ensure the following tools are installed before proceeding:

- **Node.js**: Version 20.x or higher.
- **npm**: Version 6.x or higher.
- **Docker**: Latest version (if using Docker installation).
- **PostgreSQL**: (e.g., MariaDB or compatible PostgreSQL database).

---

## Installation Options

You can install and run the bot **from source** or using **Docker**.

---

## Installation from Source

### 1. Clone the Repository

Clone the project repository from GitHub:

```bash
git clone https://github.com/CodeModule-ir/cop.git
cd cop
```

---

### 2. Install Dependencies

Run the following command to install the required packages:

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` file in the root directory and define the required environment variables. Use the template below for reference:

```env
# Telegram Bot Token
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Local Database Configuration
DB_USER=your_db_user_here
DB_PASSWORD=your_db_password_here
DB_HOST=localhost
DB_NAME=your_db_name_here
DB_PORT=5432
DB_URL=postgres://your_db_user_here:your_db_password_here@localhost:5432/your_db_name_here

# Remote/Production Database Configuration
DATABASE_URL=postgresql://your_db_user_here:your_db_password_here@your_host_here:your_port_here/your_db_name_here

# Application Port
PORT=3000

# Telegram Web Hook URL
WEB_HOOK=https://your-webhook-url-here

# Node Environment (development or production)
NODE_ENV=development
```

Refer to the `.env.example` file in the repository for more information.

---

### 4. Start the Bot

Run the bot with the following command:

```bash
npm start
```

If you're in development, you can use:

```bash
npm run dev
```

---

## Docker Installation

Docker simplifies setup and deployment by containerizing the application.

---

### 1. Pull the Docker Image

Pull the latest Docker image from Docker Hub:

```bash
docker pull codemodule/cop
```

---

### 2. Run the Docker Container

Run the bot using the pulled Docker image:

```bash
docker run -d \
  --name cop \
  --env-file .env \
  codemodule/cop
```

Ensure the `.env` file is created and filled with the required variables as described above.

---

### 3. Use Docker Compose (Optional)

For easier management of multiple services, use `docker-compose.yml`. Copy the example below:

```yaml
version: '3.8'

services:
  bot:
    image: codemodule/cop
    container_name: cop
    env_file:
      - .env
    restart: unless-stopped
    ports:
      - "3000:3000"
```

Start the containers using:

```bash
docker-compose up -d
```

Stop the containers using:

```bash
docker-compose down
```

---

## Updating the Application

### For Source Installation:

1. Pull the latest changes:

   ```bash
   git pull origin main
   ```

2. Install any updated dependencies:

   ```bash
   npm install
   ```

3. Rebuild the application:

   ```bash
   npm run build
   ```

4. Restart the bot:

   ```bash
   npm start
   ```

---

### For Docker:

1. Pull the latest Docker image:

   ```bash
   docker pull codemodule/cop
   ```

2. Rebuild and restart containers:

   ```bash
   docker-compose down && docker-compose up -d
   ```

---

## Available Scripts

Here’s a list of `npm` scripts you can use to manage the bot:

- **Stop Docker Containers**:
  ```bash
  npm run docker:stop
  ```

- **Take Down Docker Containers**:
  ```bash
  npm run docker:down
  ```

- **Build Docker Images**:
  ```bash
  npm run docker:build
  ```

- **Run Docker Containers**:
  ```bash
  npm run docker:run
  ```

- **Start Docker Containers**:
  ```bash
  npm run docker:start
  ```

- **Compile TypeScript Code**:
  ```bash
  npm run build
  ```

- **Clean Distribution Directory**:
  ```bash
  npm run clean
  ```

- **Run the Node Application**:
  ```bash
  npm run main
  ```

---

## Example `.env` Configuration

```env
# Telegram Bot Token (Set your Telegram bot token here)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Database Configuration (Local)
DB_USER=your_db_user_here
DB_PASSWORD=your_db_password_here
DB_HOST=localhost
DB_NAME=your_db_name_here
DB_PORT=5432
DB_URL=postgres://your_db_user_here:your_db_password_here@localhost:5432/your_db_name_here

# Database Configuration (Remote/Production)
DATABASE_URL=postgresql://your_db_user_here:your_db_password_here@your_host_here:your_port_here/your_db_name_here

# Application Configuration
PORT=3000
WEB_HOOK=https://your-webhook-url-here
NODE_ENV=development
```
