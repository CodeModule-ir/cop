import { ChatPermissions } from 'grammy/types';

export interface Group {
  id: number; // Primary Key
  group_id: number;
  group_name: string;
  rules: string[]; // Array of rules
  black_list: string[]; // Array of blacklisted words or user IDs
  chat_permissions: ChatPermissions; // Permissions for the group
  approved_users: number[]; // Array of user IDs of approved users
  warnings: number; // Number of warnings for the group
  is_spam_time: boolean; // Whether the group is flagged for spam
  members: number[];
}
export interface User {
  id: number; // Primary Key
  telegram_id: number; // Telegram user ID
  username: string | null; // Telegram username
  first_name: string;
  role: 'admin' | 'moderator' | 'user'; // Role of the user
  warnings: number; // Number of warnings the user has received
  approved_groups: number[]; // List of approved group IDs for the user
}
export interface Warning {
  id: number; // Primary Key
  user_id: User['id']; // Foreign Key to User table
  group_id: Group['id']; // Foreign Key to Group table
  warned_at: string; // Date/Time when the warning was issued
  reason: string; // Reason for the warning
}
export interface ApprovedUser {
  id: number; // Primary Key
  user_id: User['id']; // Foreign Key to User table
  group_id: Group['id']; // Foreign Key to Group table
  username: string; // Username of the approved user
}
export interface Channel {
  id: number; // Primary Key
  name: string; // Name of the channel
  channel_id: number; // Unique identifier for the channel
  admins: number[]; // List of admin user IDs
}
export interface GroupAdminPermissions {
  id: number; // Primary Key
  group_id: Group['id']; // Foreign Key to Group table
  user_id: User['id']; // Foreign Key to User table
  can_manage_approvals: boolean;
  can_manage_users: boolean;
  can_manage_blacklist: boolean;
  can_manage_rules: boolean;
  can_manage_pinning: boolean;
  can_manage_messages: boolean;
  can_manage_group_settings: boolean;
  can_view_group_stats: boolean;
  can_broadcast_message: boolean;
  can_view_admin_list: boolean;
}
export interface Blacklist {
  id: number; // Primary Key
  group_id: Group['id']; // Foreign Key to Group table
  blacklisted_word?: string; // Optional: blacklisted word
  blacklisted_user_id?: User['id']; // Optional: blacklisted user ID
}
export interface GroupRule {
  id: number; // Primary Key
  group_id: Group['id']; // Foreign Key to Group table
  rule_text: string; // The rule text
  added_by: User['id']; // User ID of the admin who added the rule
}
export interface GroupMessageSettings {
  id: number; // Primary Key
  group_id: Group['id']; // Foreign Key to Group table
  is_locked: boolean; // Whether the group is locked
  welcome_message: string; // Welcome message for new users
}
