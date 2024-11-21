import * as ReplyBotMessage from './jsons/ReplyBotMessage.json';
export const COMMANDS: string[] = [
  /** General Commands */
  'start',
  'help',
  'commands',
  'date',
  'joke',
  'support',
  'botinfo',
  /** Users Commands */
  'rules',
  'codetime',
  'future',
  'groupinfo',
  'report',
  'cancel',
  'link',
  'adminlist',
  /** admin Commands */
  /** Approved Commands */
  'approved',
  'disapproved',
  'approvedlist',
  /** Ban Commands */
  'ban',
  'unban',
  /** Warn Commands */
  'warn',
  'rmwarn',
  'warns',
  'warnslist',
  /** Mute Commands */
  'mute',
  'unmute',
  /** Admin Command  */
  'grant',
  'revoke',
  /** BlackList Command */
  'blacklist',
  'abl',
  'rmbl',
  'clrbl',
  /** Rules Commands */
  'rules',
  /** Pin Command */
  'pin',
  'unpin',
  /** Purge Command */
  'purge',
  /** Group Setting Command */
  'welcome',
  /** General Commands */
  'shahin',
  'aran',
] as const;

export type CommandName = (typeof COMMANDS)[number];

export function parseDuration(durationStr: string): number | null {
  const match = durationStr.match(/^(\d+)([smhd])$/);

  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000; // Seconds
    case 'm':
      return value * 60 * 1000; // Minutes
    case 'h':
      return value * 60 * 60 * 1000; // Hours
    case 'd':
      return value * 24 * 60 * 60 * 1000; // Days
    default:
      return null;
  }
}
export function tehranZone() {
  // Get current date and adjust to Tehran time zone
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;

  // Tehran timezone offset in minutes (UTC+3:30)
  const tehranOffset = 3.5 * 60;

  // Adjust time to Tehran timezone without considering DST
  return new Date(utcTime + tehranOffset * 60000);
}
export function escapeMarkdownV2(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}
export function jokeMessage() {
  const messagesData = ReplyBotMessage;
  return messagesData.messages[Math.floor(Math.random() * messagesData.messages.length)];
}
