import { Chat, User } from "grammy/types";

export interface RoastMessages {
  replyToUser: string[];
  notReplyingToAnyone: string[];
  replyToBot: string[];
}
export interface RepliedMessage {
  message_id: number;
  from?: User;
  chat: Chat;
  date: number;
  message_thread_id?: number;
  text?: string;
}
export type RateLimitConfig = {
  commandLimit?: number;
  timeFrame?: number;
};
