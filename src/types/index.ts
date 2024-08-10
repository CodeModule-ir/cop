export interface User {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
}

export interface Chat {
  id: number;
  title: string;
  type: "private" | "group" | "supergroup" | "channel";
}

export interface RepliedMessage {
  message_id: number;
  from?: User;
  chat: Chat;
  date: number;
  message_thread_id?: number;
  text?: string;
}
export interface BotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
  can_connect_to_business?: boolean; 
  has_main_web_app?: boolean; 
}
export interface RoastMessages {
  replyToUser: string[];
  notReplyingToAnyone: string[];
  replyToBot: string[];
}
