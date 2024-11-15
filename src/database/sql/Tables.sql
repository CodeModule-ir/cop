-- User table: Stores user information
CREATE TABLE IF NOT EXISTS "User" (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,       -- Telegram user ID
    username TEXT DEFAULT NULL,
    first_name TEXT,
    role TEXT CHECK (role IN ('admin','owner', 'user', 'approved_user')),  -- User roles for managing permissions
    warnings INT DEFAULT 0,                   -- Number of warnings the user has received
    approved_groups BIGINT[]                  -- Array of approved group IDs for the user
);

-- Group table: Stores information about groups managed by the bot
CREATE TABLE IF NOT EXISTS "Group" (
    id SERIAL PRIMARY KEY,
    group_id BIGINT UNIQUE NOT NULL,          -- Telegram group ID
    group_name TEXT,
    rules TEXT[],                             -- Array of rules for the group
    black_list TEXT[],                        -- Array of blacklisted words or users
    chat_permissions JSONB,                   -- JSON to store permissions
    updated_at TIMESTAMP DEFAULT NOW(),
    joined_at TIMESTAMP DEFAULT NOW(),
    approved_users BIGINT[],                  -- Array of approved user IDs
    warnings BIGINT[],                   -- Number of warnings in the group
    is_spam_time BOOLEAN DEFAULT FALSE,       -- Flag for spam detection
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

-- ApprovedUser table: Tracks users approved in specific groups
CREATE TABLE IF NOT EXISTS "ApprovedUser" (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES "User"(id),       -- User who was approved
    group_id BIGINT REFERENCES "Group"(id),     -- Group where the user was approved
    username TEXT,
    approved_at TIMESTAMP DEFAULT NOW()
);

-- Channel table: Stores channel details managed by the bot
CREATE TABLE IF NOT EXISTS  "Channel" (
    id SERIAL PRIMARY KEY,
    name TEXT,
    channel_id BIGINT UNIQUE NOT NULL,        -- Telegram channel ID
    admins BIGINT[]                           -- Array of admin user IDs for the channel
);

-- Blacklist table: Stores blacklisted words and users for each group
CREATE TABLE IF NOT EXISTS "Blacklist" (
    id SERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES "Group"(id),
    blacklisted_word TEXT,                      -- Word to be blacklisted
    blacklisted_user_id BIGINT REFERENCES "User"(id)   -- User to be blacklisted
);

-- GroupRule table: Stores individual rules for each group
CREATE TABLE IF NOT EXISTS "GroupRule" (
    id SERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES "Group"(id),
    rule_text TEXT,                             -- Text of the rule
    added_at TIMESTAMP DEFAULT NOW(),
    added_by BIGINT REFERENCES "User"(id)
);

-- GroupMessageSettings table: Stores group message settings (e.g., slow mode)
CREATE TABLE IF NOT EXISTS "GroupMessageSettings" (
    id SERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES "Group"(id),
    is_locked BOOLEAN DEFAULT FALSE,
    welcome_message TEXT,
    last_updated TIMESTAMP DEFAULT NOW()
);
