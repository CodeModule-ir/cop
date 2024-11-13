import {} from 'pg';
-- Group table: Stores information about groups managed by the bot
CREATE TABLE Group (
    id SERIAL PRIMARY KEY,
    group_id BIGINT UNIQUE NOT NULL,          -- Telegram group ID
    group_name TEXT,
    rules TEXT[],                             -- Array of rules for the group
    added_by_id BIGINT REFERENCES User(id),   -- ID of the admin who added the group
    black_list TEXT[],                        -- Array of blacklisted words or users
    chat_permissions JSONB,                   -- JSON to store permissions
    updated_at TIMESTAMP DEFAULT NOW(),
    joined_at TIMESTAMP DEFAULT NOW(),
    approved_users BIGINT[],                  -- Array of approved user IDs
    warnings INT DEFAULT 0,                   -- Number of warnings in the group
    is_spam_time BOOLEAN DEFAULT FALSE,       -- Flag for spam detection
    members INT                               -- Number of members in the group
);

-- User table: Stores user information
CREATE TABLE User (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,       -- Telegram user ID
    username TEXT,
    role TEXT CHECK (role IN ('admin', 'user', 'moderator')),  -- User roles for managing permissions
    warnings INT DEFAULT 0,                   -- Number of warnings the user has received
    approved_groups BIGINT[]                  -- Array of approved group IDs for the user
);

-- Warning table: Stores information on user warnings
CREATE TABLE Warning (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES User(id),       -- User who was warned
    group_id BIGINT REFERENCES Group(id),     -- Group where the warning was issued
    warned_at TIMESTAMP DEFAULT NOW(),
    reason TEXT
);

-- ApprovedUser table: Tracks users approved in specific groups
CREATE TABLE ApprovedUser (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES User(id),       -- User who was approved
    group_id BIGINT REFERENCES Group(id),     -- Group where the user was approved
    username TEXT,
    approved_at TIMESTAMP DEFAULT NOW()
);

-- Channel table: Stores channel details managed by the bot
CREATE TABLE Channel (
    id SERIAL PRIMARY KEY,
    name TEXT,
    channel_id BIGINT UNIQUE NOT NULL,        -- Telegram channel ID
    admins BIGINT[]                           -- Array of admin user IDs for the channel
);

-- GroupAdminPermissions table: Defines admin permissions for specific groups
CREATE TABLE GroupAdminPermissions (
    id SERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES Group(id),
    user_id BIGINT REFERENCES User(id),
    can_manage_approvals BOOLEAN DEFAULT FALSE,
    can_manage_users BOOLEAN DEFAULT FALSE,
    can_manage_blacklist BOOLEAN DEFAULT FALSE,
    can_manage_rules BOOLEAN DEFAULT FALSE,
    can_manage_pinning BOOLEAN DEFAULT FALSE,
    can_manage_messages BOOLEAN DEFAULT FALSE,
    can_manage_group_settings BOOLEAN DEFAULT FALSE,
    can_view_group_stats BOOLEAN DEFAULT FALSE,
    can_broadcast_message BOOLEAN DEFAULT FALSE,
    can_view_admin_list BOOLEAN DEFAULT FALSE
);

-- Blacklist table: Stores blacklisted words and users for each group
CREATE TABLE Blacklist (
    id SERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES Group(id),
    blacklisted_word TEXT,                      -- Word to be blacklisted
    blacklisted_user_id BIGINT REFERENCES User(id)   -- User to be blacklisted
);

-- GroupRule table: Stores individual rules for each group
CREATE TABLE GroupRule (
    id SERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES Group(id),
    rule_text TEXT,                             -- Text of the rule
    added_at TIMESTAMP DEFAULT NOW(),
    added_by BIGINT REFERENCES User(id)
);

-- GroupMessageSettings table: Stores group message settings (e.g., slow mode)
CREATE TABLE GroupMessageSettings (
    id SERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES Group(id),
    is_locked BOOLEAN DEFAULT FALSE,
    welcome_message TEXT,
    last_updated TIMESTAMP DEFAULT NOW()
);
