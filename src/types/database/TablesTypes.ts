import { ChatPermissions } from 'grammy/types';

export interface Group {
  id: number;
  group_id: number;
  group_name: string;
  black_list: string[];
  chat_permissions: ChatPermissions;
  approved_users: number[];
  warnings: number[];
  members: number[];
  updated_at: Date;
  welcome_message: string;
  joined_at: Date;
}
export interface User {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string;
  created_at: Date;
  updated_at: Date;
  role: 'admin' | 'moderator' | 'user' | 'approved_user';
  warnings: number;
  approved_groups: number[];
}
export interface Warning {
  id: number;
  user_id: User['id'];
  group_id: Group['id'];
  reason: string;
  warned_at: Date;
}
export interface Channel {
  id: number;
  name: string;
  channel_id: number;
  admins: number[];
}
export interface GroupRule {
  id: number;
  group_id: Group['id'];
  rule_text: string[];
  added_by: User['id'];
  added_at: Date;
}
