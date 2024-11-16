-- User table: Stores user information
CREATE TABLE IF NOT EXISTS "User" (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,       -- Telegram user ID
    username TEXT DEFAULT NULL,
    first_name TEXT,
    role TEXT CHECK (role IN ('admin','owner', 'user', 'approved_user')),  -- User roles for managing permissions
    warnings INT DEFAULT 0,                   -- Number of warnings the user has received
    approved_groups BIGINT[],                  -- Array of approved group IDs for the user
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Group table: Stores information about groups managed by the bot
CREATE TABLE IF NOT EXISTS "Group" (
    id SERIAL PRIMARY KEY,
    group_id BIGINT UNIQUE NOT NULL,          -- Telegram group ID
    group_name TEXT,
    black_list TEXT[],                        -- Array of blacklisted words or users
    chat_permissions JSONB,                   -- JSON to store permissions
    updated_at TIMESTAMP DEFAULT NOW(),
    joined_at TIMESTAMP DEFAULT NOW(),
    approved_users BIGINT[],                  -- Array of approved user IDs
    warnings BIGINT[],                   -- Number of warnings in the group
    is_spam_time BOOLEAN DEFAULT FALSE,       -- Flag for spam detection
    welcome_message TEXT,
    members BIGINT[]
);

-- Warning table: Stores information on user warnings
CREATE TABLE IF NOT EXISTS "Warning" (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES "User"(id),       -- User who was warned
    group_id BIGINT REFERENCES "Group"(id),     -- Group where the warning was issued
    warned_at TIMESTAMP DEFAULT NOW(),
    reason TEXT
);

-- Channel table: Stores channel details managed by the bot
CREATE TABLE IF NOT EXISTS  "Channel" (
    id SERIAL PRIMARY KEY,
    name TEXT,
    channel_id BIGINT UNIQUE NOT NULL,        -- Telegram channel ID
    admins BIGINT[]                           -- Array of admin user IDs for the channel
);

-- GroupRule table: Stores individual rules for each group
CREATE TABLE IF NOT EXISTS "GroupRule" (
    id SERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES "Group"(id),
    rule_text TEXT[],                             -- Text of the rule
    added_at TIMESTAMP DEFAULT NOW(),
    added_by BIGINT REFERENCES "User"(id)
);
-- migration table schema
CREATE TABLE IF NOT EXISTS "Migration" (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT NOW()
);