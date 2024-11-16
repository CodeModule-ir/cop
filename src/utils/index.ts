export const COMMANDS: string[] = [
  /** General Commands */
  'start',
  'help',
  'commands',
  'date',
  'viewsupportcontact',
  'getbotinfo',
  /** Users Commands */
  'rules',
  'codetime',
  'future',
  'news',
  'groupinfo',
  'report',
  'cancel',
  'link',
  'adminlist',
  /** admin Commands */
  /** Approved Commands */
  'approved','disapproved','approvedlist',
  /** Ban Commands */
  'ban','unban',
  /** Warn Commands */
  'warn','rmwarn','warns','warnslist',
  /** Mute Commands */
  'mute','unmute','mutelist',
  /** Admin Command  */
  'grant','revoke',
  /** BlackList Command */
  'blacklist','rmbl','abl',
  /** Rules Commands */
  'rules',
  /** Pin Command */
  'pin','unpin',
  /** Purge Command */
  'purge',
  /** Group Setting Command */
  'lock','unlock','title','welcome',
  /** General Commands */
  'group_stats',
  'shahin',
  'aran',
] as const;

export type CommandName = (typeof COMMANDS)[number];
